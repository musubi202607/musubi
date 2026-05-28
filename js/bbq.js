async function loadBbq() {

  const response =
    await fetch(
      API_URL + '?mode=products'
    );

  const products =
    await response.json();

  const bbq =
    products.filter(
      p => p.type === 'bbq'
    );

  const target =
    document.getElementById(
      'bbqProducts'
    );

  bbq.forEach(product => {

    target.innerHTML += `

      <div class="product-card">

        <img src="${product.image}">

        <h3>${product.name}</h3>

        <p>${product.description}</p>

        <div>
          ¥${product.price}
        </div>

      </div>

    `;
  });
}

loadBbq();