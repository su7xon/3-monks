export default async (request, context) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  
  
  if (pathParts[1] !== 'product' || !pathParts[2]) {
    return context.next();
  }

  const slug = pathParts[2];
  const idParts = slug.split('-');
  const id = idParts[idParts.length - 1];

  
  let response = await context.next();
  if (response.status === 404) {
    const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
    response = await fetch(baseUrl);
  }
  
  if (response.status !== 200) {
    return response;
  }
  
  const text = await response.text();

  try {
    
    const firebaseUrl = `https://firestore.googleapis.com/v1/projects/monks-84b29/databases/(default)/documents/products/${id}?key=AIzaSyAH-u3HGlVPYexW4oviSRKXD56_KUWvslw`;
    const productRes = await fetch(firebaseUrl);
    
    let title = slug.split('-').slice(0, -1).join(' ').toUpperCase() || "The III Monks";
    let description = "Premium Luxury Streetwear";
    let imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
    
    if (productRes.ok) {
      const productData = await productRes.json();
      const fields = productData.fields;
      
      if (fields) {
        if (fields.name?.stringValue) title = fields.name.stringValue;
        if (fields.description?.stringValue) description = fields.description.stringValue.substring(0, 150) + "...";
        
        if (fields.images && fields.images.arrayValue && fields.images.arrayValue.values && fields.images.arrayValue.values.length > 0) {
          imageUrl = fields.images.arrayValue.values[0].stringValue;
        }
      }
    }

    let newHtml = text;
    
    
    newHtml = newHtml.replace(
      /<meta property="og:title" content="[^"]*" \/>/g, 
      `<meta property="og:title" content="${title} | The III Monks" />`
    );
    
    newHtml = newHtml.replace(
      /<meta property="og:description" content="[^"]*" \/>/g, 
      `<meta property="og:description" content="${description}" />`
    );

    
    newHtml = newHtml.replace(/<meta property="og:image" content="[^"]*" \/>/g, '');
    
    
    newHtml = newHtml.replace(
      '</head>', 
      `<meta property="og:image" content="${imageUrl}" />\n</head>`
    );

    return new Response(newHtml, {
      headers: { "content-type": "text/html" },
    });
    
  } catch (error) {
    console.error("Error fetching product data:", error);
  }

  return new Response(text, {
    headers: { "content-type": "text/html" },
  });
};

export const config = {
  path: "/product/*"
};
