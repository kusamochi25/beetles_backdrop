export const supportedLocales = ['ja', 'en', 'zh', 'ko', 'es', 'th', 'fr'] as const;

export type Locale = (typeof supportedLocales)[number];

export type LocalizedText = Record<Locale, string>;

export type LocalizedArray = Record<Locale, string[]>;

export type ImageSet = {
    thumb: string;
    medium: string;
    large: string;
};

export type SpeciesImage = ImageSet & {
    caption?: LocalizedText;
};

export type SpeciesReference = {
    citation: string;
    url?: string;
};

export type SubspeciesSummary = {
    slug: string;
    name_latin: string;
    name: LocalizedText;
    region?: LocalizedText;
    description?: LocalizedText;
    images?: ImageSet | SpeciesImage[];
    references?: SpeciesReference[];
};

export type SpeciesSummary = {
    id: string;
    slug: string;
    name_latin: string;
    name: LocalizedText;
    genus: string;
    family_group: string;
    region: LocalizedText;
    description: LocalizedText;
    aliases: LocalizedArray;
    images: ImageSet | SpeciesImage[];
    references?: SpeciesReference[];
    subspecies?: SubspeciesSummary[];
};

export type SearchItem = {
    slug: string;
    name_latin: string;
    name: LocalizedText;
    genus: string;
    family_group: string;
    aliases: LocalizedArray;
    thumb: string;
    href: string;
};

export type MetaInfo = {
    title: LocalizedText;
    description: LocalizedText;
};

export type PageData = {
    kind: 'home' | 'group' | 'genus' | 'species' | 'subspecies' | 'search' | 'info';
    meta: MetaInfo;
    [key: string]: unknown;
};
