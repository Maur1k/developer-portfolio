import { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase/client';

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  return {
    ...row,
    shortDescription: row.shortDescription ?? row.short_description,
    longDescription: row.longDescription ?? row.long_description,
    repositoryUrl: row.repositoryUrl ?? row.repository_url,
    liveDemoUrl: row.liveDemoUrl ?? row.live_demo_url,
    displayOrder: row.displayOrder ?? row.display_order ?? 0,
    thumbnailImage: row.thumbnailImage ?? row.thumbnail_image,
    galleryImages: row.galleryImages ?? row.gallery_images ?? [],
    logoUrl: row.logoUrl ?? row.logo_url,
    credentialUrl: row.credentialUrl ?? row.credential_url,
    pdfUrl: row.pdfUrl ?? row.pdf_url,
    imageUrl: row.imageUrl ?? row.image_url,
  };
}

export function useCollectionData(collectionName, fallback = [], options = {}) {
  const stableOptions = useMemo(() => options, [options.orderBy, options.direction]);
  const [items, setItems] = useState(fallback);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setItems(fallback);
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    const tableName = collectionName.toLowerCase();
    const orderColumn = stableOptions.orderBy
      ? stableOptions.orderBy === 'displayOrder'
        ? 'display_order'
        : stableOptions.orderBy
      : 'display_order';
    const ascending = stableOptions.direction !== 'desc';

    const fetchData = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .order(orderColumn, { ascending });

        if (fetchError) throw fetchError;

        if (isMounted) {
          if (data && data.length > 0) {
            setItems(data.map(normalizeRow));
          } else {
            setItems(fallback);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setItems(fallback);
          setLoading(false);
        }
      }
    };

    fetchData();

    // Subscribe to realtime updates if enabled
    const channel = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [collectionName, fallback, stableOptions]);

  return { items, loading, error };
}

export function useDocumentData(collectionName, documentId, fallback = {}) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setData(fallback);
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        if (collectionName === 'siteContent' || collectionName === 'site_content') {
          const { data: result, error: fetchError } = await supabase
            .from('site_content')
            .select('data')
            .eq('key', documentId)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (isMounted) {
            setData(result?.data ? result.data : fallback);
            setLoading(false);
          }
        } else {
          const { data: result, error: fetchError } = await supabase
            .from(collectionName)
            .select('*')
            .eq('id', documentId)
            .maybeSingle();

          if (fetchError) throw fetchError;

          if (isMounted) {
            setData(result ? normalizeRow(result) : fallback);
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setData(fallback);
          setLoading(false);
        }
      }
    };

    fetchData();

    const channel = supabase
      .channel(`public:site_content:${documentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [collectionName, documentId, fallback]);

  return { data, loading, error };
}
