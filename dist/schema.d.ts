import { InferModel } from 'drizzle-orm';
export declare const pages: import("drizzle-orm/pg-core/table.js").PgTableWithColumns<{
    name: "pages";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core/index.mjs").PgColumn<{
            name: "id";
            tableName: "pages";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        url: import("drizzle-orm/pg-core/index.mjs").PgColumn<{
            name: "url";
            tableName: "pages";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        title: import("drizzle-orm/pg-core/index.mjs").PgColumn<{
            name: "title";
            tableName: "pages";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        content: import("drizzle-orm/pg-core/index.mjs").PgColumn<{
            name: "content";
            tableName: "pages";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        lastCrawled: import("drizzle-orm/pg-core/index.mjs").PgColumn<{
            name: "last_crawled";
            tableName: "pages";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const searchIndex: import("drizzle-orm/pg-core/table.js").PgTableWithColumns<{
    name: "search_index";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core/index.mjs").PgColumn<{
            name: "id";
            tableName: "search_index";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        pageId: import("drizzle-orm/pg-core/index.mjs").PgColumn<{
            name: "page_id";
            tableName: "search_index";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        keyword: import("drizzle-orm/pg-core/index.mjs").PgColumn<{
            name: "keyword";
            tableName: "search_index";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        relevance: import("drizzle-orm/pg-core/index.mjs").PgColumn<{
            name: "relevance";
            tableName: "search_index";
            dataType: "number";
            columnType: "PgDoublePrecision";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type Page = InferModel<typeof pages>;
export type NewPage = InferModel<typeof pages, 'insert'>;
export type SearchIndex = InferModel<typeof searchIndex>;
export type NewSearchIndex = InferModel<typeof searchIndex, 'insert'>;
