window.addEventListener("load", function() {
	const predictionSection = document.querySelector(".prediction-section");
	
	const productSearchForm = predictionSection.querySelector(".prediction-list .product-form");
	const productSearchInput = productSearchForm.querySelector(".input-box .search-input");
	const productList = predictionSection.querySelector(".product-list");
	const productListSection = productList.querySelector(".contents");
	
	
	const categoryButton = predictionSection.querySelector(".icon-category");
	
	const nameSortButton = productList.querySelector(".product-name .icon-filter");
	const demandSortButton = productList.querySelector(".demand .icon-filter");
	
	
	categoryButton.addEventListener("click", async() => {
	    
	    const popupContainer = document.querySelector(".popup-container");
	    const searchText = popupContainer.querySelector(".popup .search-text");
	    const categoryList = popupContainer.querySelector(".popup .popup-contents");
	    
	    /** icon-filter 클릭 시 보여지는 로직 */
	    await searchCategories();
	    
	    // 팝업 컨테이너를 보이도록 설정
	    popupContainer.style.display = 'block';
	   	
	    
		/** 카테고리 검색 조회 로직 */
		const categorySearchInput = popupContainer.querySelector(".popup .search-input");
		categorySearchInput.addEventListener("click", async() => {
		    await searchCategories();
		    
		    
		});
		const categorySearchText = popupContainer.querySelector(".popup .search-text");
		categorySearchText.addEventListener("keydown", async(e) => {
		    if (e.key === 'Enter') {
		        await searchCategories();
		    }
		});
		
		async function searchCategories() {
		    const query = searchText.value.trim();
		    
		    const url = `http://localhost:8000/categories?query=${query}`;
		    const response = await fetch(url);
		    const categoriesData = await response.json();
		    console.log(categoriesData);
		    
		    categoryList.innerHTML = "";
			for (let category of categoriesData) {
				let template = `
					<div class="content">${category}</div>
				`;
				categoryList.insertAdjacentHTML("beforeend", template);
			}
			// 각 카테고리에 클릭 이벤트 리스너
			const categories = categoryList.querySelectorAll(".content");
			categories.forEach(category => {
			    category.addEventListener("click", async() => {
			        const clickedCategory = category.textContent;
			        console.log(clickedCategory);
			        await searchProducts(clickedCategory);
			        
			        searchText.value = ""; // 검색 텍스트 초기화
				    categoryList.innerHTML = ""; // 카테고리 목록 초기화
				    
				    // 팝업 컨테이너를 숨김 상태로 변경
				    popupContainer.style.display = 'none';
			    });
			});
            
		}
		
	});
	
	// 팝업 닫기 버튼 클릭 시
	const popupCloseButton = document.querySelector(".popup-close");
	popupCloseButton.addEventListener("click", function() {
	    const popupContainer = document.querySelector(".popup-container");
	    const categoryList = popupContainer.querySelector(".popup .popup-contents");
	    const searchText = popupContainer.querySelector(".popup .search-text");
	    
	    searchText.value = ""; // 검색 텍스트 초기화
	    categoryList.innerHTML = ""; // 카테고리 목록 초기화
	    
	    // 팝업 컨테이너를 숨김 상태로 변경
	    popupContainer.style.display = 'none';
	});

		
	productSearchInput.addEventListener("click", async(e) => {
		e.preventDefault();
		
		await searchProducts();
		
		const products = productListSection.querySelectorAll(".product");
		changeStatus(products);
	});
	
	
	// 데이터 동적 생성
	async function searchProducts(category) {
		const searchText = predictionSection.querySelector(".search-bar .input-box .search-text");
		const query = searchText.value.trim();
		
		let url = ``;
		
	    if (category) {
			url = `http://localhost:8000/products?category=${category}`;
	    } else {
			url = `http://localhost:8000/products?query=${query}`;
		}
    	const response = await fetch(url);
		const productsData = await response.json();
		console.log(productsData);
		
		productListSection.innerHTML = "";
		for (let m of productsData) {
			let statusColor = m.changeStatus === "▲" ? "main-1" : "main-2";
			let plusOrMinus = m.changeStatus === "▲" ? "+" : "-";
			
			// 숫자를 콤마 단위로 포맷
    		let formattedDemandPrediction = m.demandPrediction.toLocaleString();
    
			let template = `
                <div class="product d:flex align-items:center">
                    <div class="product-name color:base-5">${m.name}</div>
	                <div class="demand color:base-5 text-align:center">${formattedDemandPrediction}</div>
                    <div class="toggle d:flex flex:col justify-content:center align-items:center">
                        <span class="h:25px font-size:3 color:${statusColor}">${m.changeStatus}</span>
                        <span class="h:25px font-size:0 color:base-5"><span>${plusOrMinus}</span>${m.changeRate}</span>
                    </div>
        		</div>
		    `;
			productListSection.insertAdjacentHTML("beforeend", template);
		}
	}
		
		
	// 제품 클릭 시 상태 변경
	function changeStatus(array) {
        array.forEach(obj => {
            obj.addEventListener("click", function() {
                // 모든 다른 요소를 순회하며 클래스 변경
                array.forEach(otherObj => {
                    if (otherObj !== obj) {
                        otherObj.classList.remove("clicked");
                        otherObj.classList.add("non-clicked");
                    }
                });

                // 현재 클릭된 요소의 클래스 변경
                if (obj.classList.contains("clicked")) {
                    obj.classList.remove("clicked");
                    obj.classList.add("non-clicked");
                } else {
                    obj.classList.remove("non-clicked");
                    obj.classList.add("clicked");
                }
            });
        });
    }
        
        
	// 각각의 정렬 방식을 저장하는 변수
	let currentSortMethod = ""; // 현재 선택된 정렬 방식
	let nameSortDirection = "desc"; // 제품명 정렬 방식
	let demandSortDirection = "asc"; // 수요예측량 정렬 방식
	
	// 제품명 정렬 버튼 클릭 시
	nameSortButton.addEventListener("click", function() {
		if (currentSortMethod !== "name") {
	        currentSortMethod = "name";
	        demandSortDirection = "asc"; // 다른 정렬 방식 초기화
	    }
	    // 정렬 방식 토글
	    nameSortDirection = nameSortDirection === "asc" ? "desc" : "asc";
	    // 목록 정렬
	    sortProductListByName();
	});
	
	// 수요예측량 정렬 버튼 클릭 시
	demandSortButton.addEventListener("click", function() {
		if (currentSortMethod !== "demand") {
	        currentSortMethod = "demand";
	        nameSortDirection = "desc"; // 다른 정렬 방식 초기화
	    }
	    // 정렬 방식 토글
	    demandSortDirection = demandSortDirection === "asc" ? "desc" : "asc";
	    // 목록 정렬
	    sortProductListByDemand();
	});
	
	
	/** 제품 정렬 함수 */
	
	// 제품명으로 정렬하는 함수
	function sortProductListByName() {
	    const products = productList.querySelectorAll(".product");
	    let sortedProducts;
	    if (nameSortDirection === "asc") {
	        sortedProducts = sortProductsByNameAsc(products);
	    } else {
	        sortedProducts = sortProductsByNameDesc(products);
	    }
	    // 정렬된 목록으로 대체
	    productList.querySelector(".contents").innerHTML = "";
	    sortedProducts.forEach(product => {
	        productList.querySelector(".contents").appendChild(product);
	    });
	}
	
	// 수요예측량으로 정렬하는 함수
	function sortProductListByDemand() {
	    const products = productList.querySelectorAll(".product");
	    let sortedProducts;
	    if (demandSortDirection === "asc") {
	        sortedProducts = sortProductsByDemandAsc(products);
	    } else {
	        sortedProducts = sortProductsByDemandDesc(products);
	    }
	    // 정렬된 목록으로 대체
	    productList.querySelector(".contents").innerHTML = "";
	    sortedProducts.forEach(product => {
	        productList.querySelector(".contents").appendChild(product);
	    });
	}
	
	// 제품명으로 오름차순 정렬하는 함수
	function sortProductsByNameAsc(products) {
	    const sortedProducts = Array.from(products).sort((a, b) => {
	        const nameA = a.querySelector(".product-name").textContent.toLowerCase();
	        const nameB = b.querySelector(".product-name").textContent.toLowerCase();
	        return nameA.localeCompare(nameB);
	    });
	    return sortedProducts;
	}
	
	// 제품명으로 내림차순 정렬하는 함수
	function sortProductsByNameDesc(products) {
	    const sortedProducts = Array.from(products).sort((a, b) => {
	        const nameA = a.querySelector(".product-name").textContent.toLowerCase();
	        const nameB = b.querySelector(".product-name").textContent.toLowerCase();
	        return nameB.localeCompare(nameA);
	    });
	    return sortedProducts;
	}
	
	// 제품 수요예측량으로 오름차순 정렬하는 함수
	function sortProductsByDemandAsc(products) {
	    const sortedProducts = Array.from(products).sort((a, b) => {
	        const demandA = parseInt(a.querySelector(".demand").textContent);
	        const demandB = parseInt(b.querySelector(".demand").textContent);
	        return demandA - demandB;
	    });
	    return sortedProducts;
	}
	
	// 제품 수요예측량으로 내림차순 정렬하는 함수
	function sortProductsByDemandDesc(products) {
	    const sortedProducts = Array.from(products).sort((a, b) => {
	        const demandA = parseInt(a.querySelector(".demand").textContent);
	        const demandB = parseInt(b.querySelector(".demand").textContent);
	        return demandB - demandA;
	    });
	    return sortedProducts;
	}


});
