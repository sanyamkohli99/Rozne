require('dotenv').config();
const { fetch } = require('cross-undici-fetch');

async function testQuery() {
  const query = `
  query LandingRouteQuery($user_id: UUID) {
    products: productsCollection(
      filter: { featured: { eq: true } }
      first: 4
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
        }
      }
    }

    wishlistCollection(filter: { user_id: { eq: $user_id } }) {
      edges {
        node {
          product_id
        }
      }
    }

    cartsCollection(filter: { user_id: { eq: $user_id } }) {
      edges {
        node {
          product_id
          quantity
        }
      }
    }

    collectionScrollCards: collectionsCollection(
      first: 6
      orderBy: [{ order: DescNullsLast }]
    ) {
      edges {
        node {
          id
        }
      }
    }
  }
  `;

  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apiKey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

testQuery();
