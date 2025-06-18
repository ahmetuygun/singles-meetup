import { Injectable, Signal, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject, of, timer } from 'rxjs';
import { catchError, shareReplay, tap, switchMap, delay } from 'rxjs/operators';

import { StateStorageService } from 'app/core/auth/state-storage.service';
import { Account } from 'app/core/auth/account.model';
import { ApplicationConfigService } from '../config/application-config.service';
import { PersonProfileService } from 'app/entities/person-profile/service/person-profile.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly userIdentity = signal<Account | null>(null);
  private readonly authenticationState = new ReplaySubject<Account | null>(1);
  private accountCache$?: Observable<Account | null> | null;
  private isAuthenticationInProgress = false;

  private readonly translateService = inject(TranslateService);
  private readonly http = inject(HttpClient);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly router = inject(Router);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly personProfileService = inject(PersonProfileService);

  authenticate(identity: Account | null): void {
    this.userIdentity.set(identity);
    this.authenticationState.next(this.userIdentity());
    if (!identity) {
      this.accountCache$ = null;
    }
  }

  trackCurrentAccount(): Signal<Account | null> {
    return this.userIdentity.asReadonly();
  }

  hasAnyAuthority(authorities: string[] | string): boolean {
    const userIdentity = this.userIdentity();
    if (!userIdentity) {
      return false;
    }
    if (!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    return userIdentity.authorities.some((authority: string) => authorities.includes(authority));
  }

  identity(force?: boolean): Observable<Account | null> {
    // Check if we're in an OAuth2 authentication flow
    if (this.isInOAuth2Flow()) {
      console.log('OAuth2 authentication flow detected, skipping account fetch');
      return of(null);
    }

    // Prevent multiple simultaneous authentication attempts
    if (this.isAuthenticationInProgress && !force) {
      console.log('Authentication already in progress, returning cached result');
      return this.accountCache$ || of(null);
    }

    if (!this.accountCache$ || force) {
      this.isAuthenticationInProgress = true;
      this.accountCache$ = this.fetch().pipe(
        switchMap((account: Account | null) => {
          if (!account) {
            return of(null);
          }
          
          this.authenticate(account);

          // After retrieve the account info, the language will be changed to
          // the user's preferred language configured in the account setting
          // unless user have chosen another language in the current session
          if (!this.stateStorageService.getLocale()) {
            this.translateService.use(account.langKey);
          }

          // Check if PersonProfile exists for the authenticated user
          return this.personProfileService.getCurrentUserProfile().pipe(
            tap((profileResponse) => {
              console.log('PersonProfile found for user:', account.login);
              const profile = profileResponse.body;
              this.navigateBasedOnTestCompletion(profile);
            }),
            catchError((error) => {
              console.log('PersonProfile error for user:', account.login, 'Error:', error);
              
              // If 404 error, it means no person profile exists
              if (error.status === 404) {
                console.log('No PersonProfile found for user');
                
                // Check if there are saved questionnaire answers to process first
                const savedAnswers = localStorage.getItem('questionnaireAnswers');
                if (savedAnswers) {
                  console.log('Found saved questionnaire answers, redirecting to questionnaire-success');
                  this.router.navigate(['/questionnaire-success']);
                } else {
                  console.log('No saved answers, redirecting to questionnaire');
                  this.router.navigate(['/questionnaire']);
                }
                return of(null);
              }
              
              // For other errors, proceed with normal navigation
              console.error('Error getting PersonProfile:', error);
              this.navigateToStoredUrl();
              return of(null);
            }),
            switchMap(() => {
              return of(account);
            })
          );
        }),
        tap(() => {
          this.isAuthenticationInProgress = false;
        }),
        catchError((error) => {
          this.isAuthenticationInProgress = false;
          return of(null);
        }),
        shareReplay(),
      );
    }
    return this.accountCache$.pipe(catchError(() => of(null)));
  }

  isAuthenticated(): boolean {
    return this.userIdentity() !== null;
  }

  getAuthenticationState(): Observable<Account | null> {
    return this.authenticationState.asObservable();
  }

  private isInOAuth2Flow(): boolean {
    const currentUrl = window.location.href;
    const currentPath = window.location.pathname;
    
    // Check if we're in the middle of an OAuth2 flow
    const isOAuth2Callback = currentPath.includes('/login/oauth2/code/') || 
                             currentUrl.includes('code=') || 
                             currentUrl.includes('state=');
    
    // Check if we're being redirected to OAuth2 authorization
    const isOAuth2Authorization = currentPath.includes('/oauth2/authorization/');
    
    // Check if we just completed a login (within the last 2 seconds)
    const lastLoginTime = sessionStorage.getItem('lastLoginTime');
    const isRecentLogin = lastLoginTime !== null && (Date.now() - parseInt(lastLoginTime)) < 2000;
    
    return isOAuth2Callback || isOAuth2Authorization || isRecentLogin;
  }

  private fetch(): Observable<Account | null> {
    return this.http.get<Account>(this.applicationConfigService.getEndpointFor('api/account')).pipe(
      catchError((error) => {
        console.log('Account fetch error:', error.status, error.message);
        
        // Handle authentication redirects (302) and unauthorized (401) gracefully
        if (error.status === 302 || error.status === 401) {
          console.log('Authentication required, user will be redirected to login');
          // Mark that we're starting a login flow
          sessionStorage.setItem('lastLoginTime', Date.now().toString());
          return of(null);
        }
        
        // For other errors, wait a bit and retry once
        if (error.status === 0 || error.status >= 500) {
          console.log('Network or server error, retrying in 1 second...');
          return timer(1000).pipe(
            switchMap(() => this.http.get<Account>(this.applicationConfigService.getEndpointFor('api/account'))),
            catchError(() => {
              console.log('Retry failed, returning null');
              return of(null);
            })
          );
        }
        
        // Re-throw other errors
        throw error;
      })
    );
  }

  private navigateToStoredUrl(): void {
    // Check if there are saved questionnaire answers to process
    const savedAnswers = localStorage.getItem('questionnaireAnswers');
    if (savedAnswers) {
      // Redirect to questionnaire success page to process answers
      this.router.navigate(['/questionnaire-success']);
      return;
    }

    // previousState can be set in the authExpiredInterceptor and in the userRouteAccessService
    // if login is successful, go to stored previousState and clear previousState
    const previousUrl = this.stateStorageService.getUrl();
    if (previousUrl) {
      this.stateStorageService.clearUrl();
      this.router.navigateByUrl(previousUrl);
    }
  }

  private navigateBasedOnTestCompletion(profile: any): void {
    // Check if test is completed
    if (profile && profile.testCompleted === false) {
      console.log('User has not completed test');
      
      // Check if there are saved questionnaire answers to process first
      const savedAnswers = localStorage.getItem('questionnaireAnswers');
      if (savedAnswers) {
        console.log('Found saved questionnaire answers, redirecting to questionnaire-success');
        this.router.navigate(['/questionnaire-success']);
      } else {
        console.log('No saved answers, redirecting to questionnaire');
        this.router.navigate(['/questionnaire']);
      }
      return;
    }
    
    // If test is completed, proceed with normal navigation
    this.navigateToStoredUrl();
  }
}

