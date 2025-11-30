**Please read the instructions carefully: this is not a timed test. The deadline to submit is 2 days after assignment.**

**Full-stack dev: do both parts**

This is a test project only. You can take as much time as needed. Send the deployed app URL and Github link. No access limitations please. The deadline to submit is 2 days after assignment.

If we like your design, presentation and code, we will schedule an interview with the hiring manager.

**Focus on the presentation and scalable code: beautiful and extraordinary design: first impression. Show your own creativity as well.**

We're looking for a full-stack engineer skilled in GraphQL and Node.js to support our React-based application. Frontend Tech Stack: React, CSS, HTML, and UI relevant tech stack.

---

## Frontend: A POC demonstrating:

- **Sidebar Navigation** with collapsible categories (e.g., Electronics, Clothing, Home & Garden) - one level deep sub-categories.

- **Top Navigation Bar** with search functionality, user profile dropdown, and cart icon with item count badge.

- **Main Content Area** displaying a beautiful grid view of products. For example, imagine showing product data with fields like: Image, Name, Price, Category, Stock Status, Rating, SKU, Brand, Discount %, and Date Added (10 columns).

- **View Toggle**: When the user wants to see the same product data, it should switch to a card/tile view showing essential fields only (Image, Name, Price, Rating, Stock Status).

- **Action Menu**: Each card will have a kebab menu (three dots) for additional options such as Edit, Add to Favorites, Compare, Archive, etc.

- **Detail View**: When a card is clicked, show the entire details of the product in a beautiful expanded view. This can be a slide-out panel, modal, or expanded card style.

- **Navigation**: User should be able to navigate back to the card view from the expanded detail view seamlessly.

- **Data Source**: Any public API can be used to display the content on the grid/card view (e.g., FakeStore API, DummyJSON, or create mock data).

---

## Backend:

- **Backend Setup**: Create a GraphQL API using Node.js (Apollo Server or similar).

- **Data Model**: Store product data with fields like:
  - ID
  - Name
  - Description
  - Price
  - Category
  - Brand
  - SKU
  - Stock Quantity
  - Rating (average)
  - Reviews Count
  - Image URLs
  - Created At
  - Updated At

- **GraphQL Schema**:

  - **Queries**:
    - List products with optional filters (by category, price range, brand, stock status).
    - Retrieve details for a single product by ID.
    - List products with pagination (cursor-based or offset).
    - Search products by name or description.

  - **Mutations**:
    - Add a new product.
    - Update an existing product.
    - Delete a product (soft delete preferred).
    - Update stock quantity.

- **Pagination & Sorting**: Implement pagination for queries and sorting options (by price, rating, date added, name).

- **Authentication & Authorization**: Secure API with role-based access control:
  - **Admin**: Full access (CRUD operations on all products).
  - **Manager**: Can add/update products but cannot delete.
  - **Viewer**: Read-only access to product listings.

- **Performance Optimization**: Please demonstrate essential performance considerations such as:
  - Query complexity limiting
  - DataLoader for N+1 problem prevention
  - Caching strategy
  - Index optimization suggestions

---

## Bonus Points (Optional):

- Implement real-time stock updates using GraphQL Subscriptions.
- Add unit tests for critical resolvers.
- Docker containerization for easy deployment.
- CI/CD pipeline configuration.

---

## Evaluation Criteria:

| Area | Weight |
|------|--------|
| UI/UX Design & Presentation | 25% |
| Code Quality & Organization | 25% |
| GraphQL Implementation | 20% |
| Authentication & Authorization | 15% |
| Performance Considerations | 10% |
| Documentation | 5% |

---

**Good luck! We look forward to reviewing your submission.**
