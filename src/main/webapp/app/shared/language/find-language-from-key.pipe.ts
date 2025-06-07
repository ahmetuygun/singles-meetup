import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findLanguageFromKey',
})
export default class FindLanguageFromKeyPipe implements PipeTransform {
  private readonly languages: Record<string, { name: string; rtl?: boolean }> = {
    en: { name: 'English' },
    ca: { name: 'Català' },
    fr: { name: 'Français' },
    de: { name: 'Deutsch' },
    it: { name: 'Italiano' },
    pl: { name: 'Polski' },
    'pt-br': { name: 'Português (Brasil)' },
    ro: { name: 'Română' },
    es: { name: 'Español' },
    tr: { name: 'Türkçe' },
    // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object
  };

  transform(lang: string): string {
    return this.languages[lang].name;
  }
}
