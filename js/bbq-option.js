async function loadBbqOptions(){

  const response =
    await fetch(
      API_URL +
      '?mode=products'
    );

  const products =
    await response.json();

  const bbqOptions =
    products.filter(
      p =>
        p.type ===
        'bbq-option'
    );

  const grid =
    document.getElementById(
      'productGrid'
    );

  grid.innerHTML = '';

  bbqOptions.forEach(
    product => {

      grid.innerHTML += `

        <div class="product-card">

          <img
            src="${product.image}"
            alt="${product.name}"
          >

          <div
            class="product-content"
          >

            <h3>

              ${product.name}

            </h3>

            <p>

              ${product.description}

            </p>

            <div class="price">

              ¥${Number(
                product.price
              ).toLocaleString()}

            </div>

            <button

              onclick="
                addBbqOption(
                  ${product.id},
                  '${product.name}',
                  ${product.price}
                )
              "

            >

              追加する

            </button>

          </div>

        </div>

      `;

    }
  );

}

function addBbqOption(
  id,
  name,
  price
){

  const cart =
    JSON.parse(
      localStorage.getItem(
        'bbqOptionCart'
      )
    ) || [];

  const existing =
    cart.find(
      item =>
        item.id === id
    );

  if(existing){

    existing.qty += 1;

  }else{

    cart.push({

      id:id,

      name:name,

      price:price,

      qty:1

    });

  }

  localStorage.setItem(

    'bbqOptionCart',

    JSON.stringify(
      cart
    )

  );

  alert(
    '追加しました'
  );

}

loadBbqOptions();