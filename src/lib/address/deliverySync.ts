/**
 * Centralized logic for the next delivery address after a mutation.
 * Used by useAddressMutations and callers to avoid duplicating conditions.
 */

import type { Address } from '@/types/address';

export type DeliveryMutationEvent =
    | 'created'
    | 'updated'
    | 'deleted'
    | 'set_default';

export interface GetNextDeliveryAddressOptions {
    event: DeliveryMutationEvent;
    currentDeliveryAddress: Address | null;
    newAddress?: Address;
    updatedAddress?: Address;
    deletedId?: number;
}

/**
 * Returns the address (or null) that should be set as deliveryAddress after a mutation.
 * Use this in mutation onSuccess to keep SubHeader/checkout in sync without overwriting
 * the user's selection when editing a different address.
 */
export function getNextDeliveryAddressAfterMutation(
    options: GetNextDeliveryAddressOptions,
): Address | null {
    const {
        event,
        currentDeliveryAddress,
        newAddress,
        updatedAddress,
        deletedId,
    } = options;

    switch (event) {
        case 'created':
            // Only set delivery to the new address if it's default (or first address)
            if (newAddress?.is_default) return newAddress;
            return currentDeliveryAddress;

        case 'updated':
        case 'set_default':
            // Update display only if the edited address is the one currently shown, or it became default
            if (!updatedAddress) return currentDeliveryAddress;
            const isCurrent =
                currentDeliveryAddress &&
                Number(currentDeliveryAddress.id) === Number(updatedAddress.id);
            if (isCurrent || updatedAddress.is_default) return updatedAddress;
            return currentDeliveryAddress;

        case 'deleted':
            if (
                deletedId != null &&
                currentDeliveryAddress &&
                Number(currentDeliveryAddress.id) === deletedId
            ) {
                return null;
            }
            return currentDeliveryAddress;

        default:
            return currentDeliveryAddress;
    }
}
