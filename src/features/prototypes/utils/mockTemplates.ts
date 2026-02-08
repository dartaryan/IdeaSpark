// src/features/prototypes/utils/mockTemplates.ts

export interface MockTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const mockTemplates: MockTemplate[] = [
  {
    id: 'successObject',
    name: 'Success Object',
    description: 'Single resource response',
    content: JSON.stringify(
      { id: 1, name: 'Example', status: 'active' },
      null,
      2,
    ),
  },
  {
    id: 'arrayList',
    name: 'Array List',
    description: 'List of resources',
    content: JSON.stringify(
      [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
      null,
      2,
    ),
  },
  {
    id: 'paginatedResponse',
    name: 'Paginated Response',
    description: 'Paginated list with metadata',
    content: JSON.stringify(
      {
        data: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        page: 1,
        pageSize: 10,
        total: 42,
      },
      null,
      2,
    ),
  },
  {
    id: 'errorResponse',
    name: 'Error Response',
    description: '404 error response',
    content: JSON.stringify(
      { error: 'Not Found', message: 'Resource not found', statusCode: 404 },
      null,
      2,
    ),
  },
  {
    id: 'emptyResponse',
    name: 'Empty Response',
    description: 'Empty JSON object',
    content: JSON.stringify({}, null, 2),
  },
];
