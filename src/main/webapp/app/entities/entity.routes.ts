import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'singlesMeetup2App.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'person-profile',
    data: { pageTitle: 'singlesMeetup2App.personProfile.home.title' },
    loadChildren: () => import('./person-profile/person-profile.routes'),
  },
  {
    path: 'test-question',
    data: { pageTitle: 'singlesMeetup2App.testQuestion.home.title' },
    loadChildren: () => import('./test-question/test-question.routes'),
  },
  {
    path: 'test-answer-option',
    data: { pageTitle: 'singlesMeetup2App.testAnswerOption.home.title' },
    loadChildren: () => import('./test-answer-option/test-answer-option.routes'),
  },
  {
    path: 'user-test-answer',
    data: { pageTitle: 'singlesMeetup2App.userTestAnswer.home.title' },
    loadChildren: () => import('./user-test-answer/user-test-answer.routes'),
  },
  {
    path: 'event',
    data: { pageTitle: 'singlesMeetup2App.event.home.title' },
    loadChildren: () => import('./event/event.routes'),
  },
  {
    path: 'user-event',
    data: { pageTitle: 'singlesMeetup2App.userEvent.home.title' },
    loadChildren: () => import('./user-event/user-event.routes'),
  },
  {
    path: 'venue',
    data: { pageTitle: 'singlesMeetup2App.venue.home.title' },
    loadChildren: () => import('./venue/venue.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
