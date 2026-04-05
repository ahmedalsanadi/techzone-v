'use client';

import { useReducer, useEffect } from 'react';
import { useCountries, useCities, useDistricts } from './useAddresses';

export interface LocationState {
    selectedCountry: number | '';
    selectedCity: number | '';
    selectedDistrict: number | '';
}

type LocationAction =
    | { type: 'SET_COUNTRY'; value: number | '' }
    | { type: 'SET_CITY'; value: number | '' }
    | { type: 'SET_DISTRICT'; value: number | '' }
    | { type: 'RESET'; payload?: Partial<LocationState> };

const locationReducer = (
    state: LocationState,
    action: LocationAction,
): LocationState => {
    switch (action.type) {
        case 'SET_COUNTRY':
            return {
                ...state,
                selectedCountry: action.value,
                selectedCity: '',
                selectedDistrict: '',
            };
        case 'SET_CITY':
            return {
                ...state,
                selectedCity: action.value,
                selectedDistrict: '',
            };
        case 'SET_DISTRICT':
            return { ...state, selectedDistrict: action.value };
        case 'RESET':
            return {
                selectedCountry: '',
                selectedCity: '',
                selectedDistrict: '',
                ...action.payload,
            };
        default:
            return state;
    }
};

const initialState: LocationState = {
    selectedCountry: '',
    selectedCity: '',
    selectedDistrict: '',
};

export interface UseLocationLogicOptions {
    /**
     * When true, do not auto-select the first country when selection is empty.
     * Required for edit flows: otherwise the effect can run before the modal
     * applies saved country/city and overwrite them (SET_COUNTRY clears city).
     */
    suppressAutoSelectCountry?: boolean;
}

/**
 * Hook to manage dependent location dropdowns (Country -> City -> District).
 */
export function useLocationLogic(
    initialData?: Partial<LocationState>,
    enabled: boolean = true,
    options?: UseLocationLogicOptions,
) {
    const [state, dispatch] = useReducer(locationReducer, {
        ...initialState,
        ...initialData,
    });

    const { data: countries = [] } = useCountries(enabled);
    const { data: cities = [], isLoading: isLoadingCities } = useCities(
        enabled && state.selectedCountry ? Number(state.selectedCountry) : null,
    );
    const { data: districts = [], isLoading: isLoadingDistricts } =
        useDistricts(
            enabled && state.selectedCity ? Number(state.selectedCity) : null,
        );

    // Auto-select first country if none selected (add flow only — see suppressAutoSelectCountry)
    useEffect(() => {
        if (!enabled) return;
        if (options?.suppressAutoSelectCountry) return;
        if (!state.selectedCountry && countries.length > 0) {
            dispatch({ type: 'SET_COUNTRY', value: countries[0].id });
        }
    }, [
        countries,
        state.selectedCountry,
        enabled,
        options?.suppressAutoSelectCountry,
    ]);

    return {
        state,
        dispatch,
        countries,
        cities,
        districts,
        isLoadingCities,
        isLoadingDistricts,
    };
}
