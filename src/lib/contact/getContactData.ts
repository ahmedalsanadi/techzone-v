/**
 * Utility to fetch and process contact page data
 */

import { branchService } from '@/services/branch-service';
import { getServerStoreConfig } from '@/lib/server/store-config';
import { redirect } from '@/i18n/navigation';
import type { Branch } from '@/types/branches';
import type { StoreInfo } from '@/services/types';

interface ContactData {
    branch: Branch | null;
    branchFetchError: boolean;
    store: StoreInfo | undefined;
}

export async function getContactData(branchId?: string): Promise<ContactData> {
    // Use shared server context to avoid duplicate API calls
    const config = await getServerStoreConfig();
    const store = config?.store;

    let branch: Branch | null = null;
    let branchFetchError = false;

    if (branchId) {
        const branchIdNum = Number(branchId);
        if (isNaN(branchIdNum) || branchIdNum <= 0) {
            redirect('/contact');
        }

        try {
            branch = await branchService.getBranch(branchIdNum);
            if (!branch) {
                branchFetchError = true;
            }
        } catch (error) {
            console.error('Failed to fetch branch for contact page:', error);
            branchFetchError = true;
        }
    }

    return { branch, branchFetchError, store };
}
