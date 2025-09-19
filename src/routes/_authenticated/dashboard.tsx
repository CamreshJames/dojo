import { createFileRoute, Link } from '@tanstack/react-router';
import { UniversalTableWithProvider } from '@lib/utils/table/Table';
import type { UniversalColumn, RowProps } from '@lib/utils/table/Table';
import type { User, Product } from '@lib/types/api';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: RouteComponent,
});

// Mock User data
const mockUsers: User[] = [
  {
    id: 19,
    email: 'ochomoswill@gmail.com',
    name: 'Ochomoswill',
    google_id: '106925395295268822541',
    role: 'trainee',
    status: 'approved',
    avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocLNG01W8-1auBhKJjJf5_tbbwvU_-vI0-vsvMQy-jKukT2ISRqz=s96-c',
    created_at: '2025-06-17T03:41:40.502Z',
    updated_at: '2025-06-17T23:04:09.754Z',
  },
  {
    id: 17,
    email: 'amanda.thomas@email.com',
    name: 'Amanda Thomas',
    google_id: 'google_trainee_014',
    role: 'trainee',
    status: 'pending',
    avatar_url: 'https://i.pravatar.cc/150?img=16',
    created_at: '2025-06-17T02:07:03.763Z',
    updated_at: '2025-06-17T02:07:03.763Z',
  },
  {
    id: 18,
    email: 'spam.user@email.com',
    name: 'Spam User',
    google_id: 'google_trainee_015',
    role: 'trainee',
    status: 'rejected',
    avatar_url: null,
    created_at: '2025-06-12T02:07:03.763Z',
    updated_at: '2025-06-17T02:07:03.763Z',
  },
];

// Mock Product data
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Smartphone',
    price: 699.99,
    category: 'electronics',
    inStock: true,
    created_at: '2025-09-01T10:00:00.000Z',
  },
  {
    id: 2,
    name: 'T-Shirt',
    price: 19.99,
    category: 'clothing',
    inStock: true,
    created_at: '2025-09-02T12:00:00.000Z',
  },
  {
    id: 3,
    name: 'Sci-Fi Novel',
    price: 12.50,
    category: 'books',
    inStock: false,
    created_at: '2025-09-03T15:00:00.000Z',
  },
];

// User table columns
const userColumns: UniversalColumn<User>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    filterable: true,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    filterable: true,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    render: (value) => (
      <span
        style={{
          color:
            value === 'approved' ? '#28a745' : value === 'rejected' ? '#dc3545' : '#ffc107',
          fontWeight: 'bold',
        }}
      >
        {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
      </span>
    ),
  },
  {
    key: 'id',
    label: 'Actions',
    render: (value) => (
      <Link to="/users/$id" params={{ id: String(value) }}>
        View
      </Link>
    ),
  },
];

// Product table columns
const productColumns: UniversalColumn<Product>[] = [
  {
    key: 'name',
    label: 'Product Name',
    sortable: true,
    filterable: true,
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true,
    render: (value) => `$${Number(value).toFixed(2)}`,
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    filterable: true,
    render: (value) => String(value).charAt(0).toUpperCase() + String(value).slice(1),
  },
  {
    key: 'inStock',
    label: 'Stock',
    sortable: true,
    render: (value) => (
      <span style={{ color: value ? '#28a745' : '#dc3545' }}>
        {value ? 'In Stock' : 'Out of Stock'}
      </span>
    ),
  },
];

// Row props for User table
const getUserRowProps = (row: User): RowProps<User> => ({
  className:
    row.status === 'rejected'
      ? 'rejected-row'
      : row.status === 'approved'
      ? 'approved-row'
      : 'pending-row',
  onClick: () => console.log('Clicked user:', row),
});

// Row props for Product table
const getProductRowProps = (row: Product): RowProps<Product> => ({
  className: row.inStock ? 'in-stock-row' : 'out-of-stock-row',
  onClick: () => console.log('Clicked product:', row),
});

function RouteComponent() {
  const handleUserRefresh = () => {
    console.log('Refreshing user data...'); // Replace with API call
  };

  const handleProductRefresh = () => {
    console.log('Refreshing product data...'); // Replace with API call
  };

  return (
    <div className="route-container">
      <h1>Dashboard</h1>

      {/* Users Table */}
      <section>
        <h2>Users</h2>
        <UniversalTableWithProvider<User>
          tableId="users-table"
          data={mockUsers}
          columns={userColumns}
          getRowProps={getUserRowProps}
          onRefresh={handleUserRefresh}
          pageSize={2}
          showToolbar
          showPagination
          className="users-table"
        />
      </section>

      {/* Products Table */}
      <section style={{ marginTop: '2rem' }}>
        <h2>Products</h2>
        <UniversalTableWithProvider<Product>
          tableId="products-table"
          data={mockProducts}
          columns={productColumns}
          getRowProps={getProductRowProps}
          onRefresh={handleProductRefresh}
          pageSize={2}
          showToolbar
          showPagination
          className="products-table"
        />
      </section>
    </div>
  );
}