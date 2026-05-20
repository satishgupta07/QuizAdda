import { Routes } from '@angular/router';
import { adminGuard } from './services/admin.guard';
import { userGuard } from './services/user.guard';

/**
 * Standalone-component routing. Every page is lazy-loaded with `loadComponent`
 * so the initial bundle stays small — admin pages only download when a user
 * actually opens the admin dashboard.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin/welcome/welcome.component').then(m => m.WelcomeComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/admin/view-categories/view-categories.component').then(m => m.ViewCategoriesComponent)
      },
      {
        path: 'add-category',
        loadComponent: () =>
          import('./pages/admin/add-category/add-category.component').then(m => m.AddCategoryComponent)
      },
      {
        path: 'quizzes',
        loadComponent: () =>
          import('./pages/admin/view-quizzes/view-quizzes.component').then(m => m.ViewQuizzesComponent)
      },
      {
        path: 'add-quiz',
        loadComponent: () =>
          import('./pages/admin/add-quiz/add-quiz.component').then(m => m.AddQuizComponent)
      },
      {
        path: 'update-quiz/:quizId',
        loadComponent: () =>
          import('./pages/admin/add-quiz/add-quiz.component').then(m => m.AddQuizComponent)
      },
      {
        path: 'quiz/view-questions/:quizId/:title',
        loadComponent: () =>
          import('./pages/admin/view-quiz-questions/view-quiz-questions.component').then(m => m.ViewQuizQuestionsComponent)
      },
      {
        path: 'quiz/add-question/:quizId/:title',
        loadComponent: () =>
          import('./pages/admin/add-question/add-question.component').then(m => m.AddQuestionComponent)
      }
    ]
  },
  {
    path: 'user-dashboard',
    canActivate: [userGuard],
    loadComponent: () =>
      import('./pages/user/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/user/load-quiz/load-quiz.component').then(m => m.LoadQuizComponent)
      },
      {
        path: ':categoryId',
        loadComponent: () =>
          import('./pages/user/load-quiz/load-quiz.component').then(m => m.LoadQuizComponent)
      },
      {
        path: 'instructions/:quizId',
        loadComponent: () =>
          import('./pages/user/instructions/instructions.component').then(m => m.InstructionsComponent)
      }
    ]
  },
  {
    path: 'quiz/start/:quizId',
    canActivate: [userGuard],
    loadComponent: () =>
      import('./pages/user/start-page/start-page.component').then(m => m.StartPageComponent)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
