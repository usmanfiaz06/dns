import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Invoice } from '../types/invoice';

export function useFirestoreInvoices(companyId: string | undefined) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to invoices for the company
  useEffect(() => {
    if (!companyId) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'invoices'),
      where('companyId', '==', companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoiceList = snapshot.docs.map(d => d.data() as Invoice);
      // Sort by modifiedAt descending
      invoiceList.sort((a, b) =>
        new Date(b.modifiedAt || b.createdAt).getTime() - new Date(a.modifiedAt || a.createdAt).getTime()
      );
      setInvoices(invoiceList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching invoices:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [companyId]);

  const saveInvoice = useCallback(async (invoice: Invoice) => {
    if (!companyId) return;
    const invoiceWithCompany = { ...invoice, companyId };
    await setDoc(doc(db, 'invoices', invoice.id), invoiceWithCompany);
  }, [companyId]);

  const deleteInvoice = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'invoices', id));
  }, []);

  return { invoices, loading, saveInvoice, deleteInvoice };
}

// Get a single invoice by ID (for shared links)
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const docRef = doc(db, 'invoices', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Invoice;
    }
    return null;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }
}
