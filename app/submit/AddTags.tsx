"use client"
import React from 'react'
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from '@/components/ui/shadcn-io/tags';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { TAGS as SAMPLE_TAGS } from '@/lib/sampleData';

const defaultTags = SAMPLE_TAGS.map((name) => ({ id: name, label: name }));

export default function AddTags(){
    const [selected, setSelected] = useState<string[]>([]);
    const [newTag, setNewTag] = useState<string>('');
    const [tags, setTags] = useState<{ id: string; label: string }[]>(defaultTags);

    useEffect(() => {
        let cancelled = false;
        const client = getSupabaseClient();
        async function loadTags() {
            if (!client) return;
            const { data, error } = await client.from('tags').select('name').order('name', { ascending: true });
            if (cancelled) return;
            if (error) {
                console.warn('Failed to fetch tags', error.message);
                return;
            }
            const names = Array.isArray(data) ? data.map((t: any) => String(t.name)) : [];
            const unique = Array.from(new Set(names));
            setTags(unique.map((n) => ({ id: n, label: n })));
        }
        loadTags();
        return () => { cancelled = true; };
    }, []);

    const handleRemove = (value: string) => {
        if (!selected.includes(value)) {
        return;
        }

        console.log(`removed: ${value}`);
        setSelected((prev) => prev.filter((v) => v !== value));
    };

    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
        handleRemove(value);
        return;
        }

        console.log(`selected: ${value}`);
        setSelected((prev) => [...prev, value]);
    };

    const handleCreateTag = () => {
        console.log(`created: ${newTag}`);

        setTags((prev) => [
        ...prev,
        {
            id: newTag,
            label: newTag,
        },
        ]);
        setSelected((prev) => [...prev, newTag]);
        setNewTag('');
    };

    return(
        <>
            <Tags className="w-full">
                <TagsTrigger className="cursor-pointer dark:bg-transparent py-2 px-4 rounded-md bg-white text-base border border-black/10 dark:border-white/10">
                    {selected.map((tag) => (
                    <TagsValue key={tag} onRemove={() => handleRemove(tag)}>
                        {tags.find((t) => t.id === tag)?.label}
                    </TagsValue>
                    ))}
                </TagsTrigger>

                <TagsContent>
                    <TagsInput onValueChange={setNewTag} placeholder="Search tag..." />
                    <TagsList>
                        <TagsEmpty>
                           <button
                                className="mx-auto flex cursor-pointer items-center gap-2 dark:bg-white/5 py-2 px-4 rounded-md bg-black/5 text-base"
                                onClick={handleCreateTag}
                                type="button"
                            >
                                <PlusIcon className="text-muted-foreground" size={16} />
                                {newTag}
                            </button>
                        </TagsEmpty>

                        <TagsGroup>
                            {tags
                            .filter((tag) => !selected.includes(tag.id))
                            .map((tag) => (
                                <TagsItem key={tag.id} onSelect={handleSelect} value={tag.id}>
                                    {tag.label}
                                </TagsItem>
                            ))}
                        </TagsGroup>
                    </TagsList>
                </TagsContent>
            </Tags>
            <input type="hidden" name="tags" value={selected.join(',')} />
        </>
    )
}
