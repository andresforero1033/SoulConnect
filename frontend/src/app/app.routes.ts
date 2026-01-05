import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'pacientes' },
	{
		path: 'pacientes',
		loadComponent: () => import('./pages/patients.page').then(m => m.PatientsPageComponent)
	},
	{
		path: 'citas',
		loadComponent: () => import('./pages/appointments.page').then(m => m.AppointmentsPageComponent)
	},
	{
		path: 'historias',
		loadComponent: () => import('./pages/histories.page').then(m => m.HistoriesPageComponent)
	},
	{
		path: 'indicadores',
		loadComponent: () => import('./pages/indicators.page').then(m => m.IndicatorsPageComponent)
	},
	{ path: '**', redirectTo: 'pacientes' }
];
