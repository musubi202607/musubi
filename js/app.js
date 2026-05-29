async function loadProducts() {

  const response =
    await fetch(
      API_URL + '?mode=products'
    );

  const products =
    await response.json();

  const onigiri =
    products.filter(
      p => p.type === 'onigiri'
    );

  const grid =
    document.getElementById(
      'productGrid'
    );

  grid.innerHTML = '';

  onigiri.forEach(product => {

    grid.innerHTML += `

      <div class="product-card">

        <img src="${product.image}">

        <div class="product-content">

          <h3>
            ${product.name}
          </h3>

          <p>
            ${product.description}
          </p>

          <div class="price">
            ¥${product.price}
          </div>

          <button
            onclick="
              addToCart(
                ${product.id}
              )
            "
          >
            カートに追加
          </button>

        </div>

      </div>

    `;
  });

}

loadProducts();

window.addEventListener(
  'pageshow',
  () => {

    updateCartCount();

  }
);