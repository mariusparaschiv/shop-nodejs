const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use('/assets', express.static('assets'))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/products', (req, res) => {
	fs.readFile('products.json', 'utf8', function (err, data) {
		if (err) throw err;
		let results = JSON.parse(data).map(obj => ({
			...obj,
			price: Number(obj.price.slice(1))
		}));

		const { page, limit, sort, productName: name, minPrice, maxPrice } = req.query;

		const sortProducts = (products, sort) => {
			if(sort && sort === 'desc') {
				return products.sort((a, b) => b.price - a.price);
			}
	
			if(sort && sort === 'asc') {
				return products.sort((a, b) => a.price - b.price);
			}

			return products;
		}

		const searchProducts = (products, name) => {
			if(name) {
				return products.filter((obj) => {
					const words = obj.name.toLowerCase().split(' ');
					for (word of words) {
						if (word.startsWith(name.toLowerCase())) {
							return obj;
						}
					}
				});
			}

			return products;
		}

		const rangeProducts = (products, minPrice = 0, maxPrice = 9999999999) => {
			return products.filter(obj => obj.price >= minPrice && obj.price <= maxPrice);
		}

		results = sortProducts(results, sort);
		results = searchProducts(results, name);
		results = rangeProducts(results, minPrice, maxPrice);
		
		const count = results.length;
		const pages = Math.ceil(results.length / limit);

		if(page && limit) {
			results = results.slice((page - 1) * limit, limit * page);
		}
		
		res.json({ count, pages, items: results });
	});
});



app.listen(8080);