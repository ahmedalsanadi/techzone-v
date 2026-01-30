'use client';

import { useReducer, useEffect } from 'react';
import { useCountries, useCities, useDistricts } from '@/hooks/useAddresses';

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

/**
 * Hook to manage dependent location dropdowns (Country -> City -> District).
 */
export function useLocationLogic(initialData?: Partial<LocationState>) {
    const [state, dispatch] = useReducer(locationReducer, {
        ...initialState,
        ...initialData,
    });

    const { data: countries = [] } = useCountries();
    const { data: cities = [], isLoading: isLoadingCities } = useCities(
        state.selectedCountry ? Number(state.selectedCountry) : null,
    );
    const { data: districts = [], isLoading: isLoadingDistricts } =
        useDistricts(state.selectedCity ? Number(state.selectedCity) : null);

    // Auto-select first country if none selected
    useEffect(() => {
        if (!state.selectedCountry && countries.length > 0) {
            dispatch({ type: 'SET_COUNTRY', value: countries[0].id });
        }
    }, [countries, state.selectedCountry]);

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
