import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { takeLatest, put } from 'redux-saga/effects';

import { RootState } from './types';

export type AppSliceState = {
	isReady: boolean;
	isFetching: boolean;
	isFetched: boolean;
	isRefreshing: boolean;
	fetchError: string | null;
	isSystemUpgrading: boolean;
};

const initialState: AppSliceState = {
	isReady: false,
	isFetching: false,
	isFetched: false,
	isRefreshing: false,
	fetchError: null,
	isSystemUpgrading: false,
};

const sliceName = 'app';

export const appSlice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		setAppReady: state => {
			state.isReady = true;
		},
		fetchAppStatusRequest: state => {
			state.fetchError = null;
			state.isFetching = true;
			if (state.isFetched) {
				state.isRefreshing = true;
			}
		},
		fetchAppStatusFailure: (state, action: PayloadAction<{ error: string }>) => {
			state.fetchError = action.payload.error;
			state.isFetching = false;
			state.isRefreshing = false;
		},
		fetchAppStatusSuccess: (state, action: PayloadAction<{ reason: boolean }>) => {
			state.isSystemUpgrading = action.payload.reason;
			state.isFetching = false;
			state.isRefreshing = false;
			state.isFetched = true;
		},
		setSystemUpgrading: (state, action: PayloadAction<{ reason: boolean }>) => {
			state.isSystemUpgrading = action.payload.reason;
		},
	},
});

export const {
	setAppReady,
	fetchAppStatusRequest,
	fetchAppStatusFailure,
	fetchAppStatusSuccess,
	setSystemUpgrading,
} = appSlice.actions;

const getAppState = (state: RootState) => state.app;
export const getAppIsReady = (state: RootState) => getAppState(state).isReady;
export const getAppIsOnMaintenance = (state: RootState) => !!getAppState(state).isSystemUpgrading;

function* fetchSystemStatus() {
	try {
		const isSystemUpgrading = false;
		yield put(fetchAppStatusSuccess({ reason: isSystemUpgrading }));
		return true;
	} catch (e: any) {
		yield put(fetchAppStatusFailure({ error: e.message }));
		return false;
	}
}

export function* watchFetchSystemStatusRequest() {
	yield takeLatest(fetchAppStatusRequest.type, fetchSystemStatus);
}

export default appSlice.reducer;
