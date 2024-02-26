window.addEventListener("load", function() {
	const predictionSection = document.querySelector(".prediction-section");
	
	const productSearchForm = predictionSection.querySelector(".prediction-list form");
	const productList = predictionSection.querySelector(".product-list");
	
	const categoryButton = predictionSection.querySelector(".icon-category");
	const productListSection = productList.querySelector(".contents");
	
	const nameSortButton = productList.querySelector(".product-name .icon-filter");
	const demandSortButton = productList.querySelector(".demand .icon-filter");
	
	
	categoryButton.addEventListener("click", async(e) => {
	    e.preventDefault();
	    
	    const popupContainer = document.querySelector(".popup-container");
	    
	    // 팝업 컨테이너를 보이도록 설정
	    popupContainer.style.display = 'block';
	    
		
	});
	
	// 팝업 닫기 버튼 클릭 시
	const popupCloseButton = document.querySelector(".popup-close");
	popupCloseButton.addEventListener("click", function() {
	    const popupContainer = document.querySelector(".popup-container");
	    
	    // 팝업 컨테이너를 숨김 상태로 변경
	    popupContainer.style.display = 'none';
	});

		
	productSearchForm.addEventListener("submit", async(e) => {
		e.preventDefault();
		
		const searchtext = predictionSection.querySelector(".search-bar .input-box .search-text");
		const query = searchtext.value.trim();

		const url = `http://localhost:8000/products?query=${query}`;
		const response = await fetch(url);
		const productsData = await response.json();
		
		// 데이터 동적 생성
		productListSection.innerHTML = "";
        
		for (let m of productsData) {
			let template = `
                <div class="product d:flex align-items:center">
                    <div class="product-name color:base-5">${m.name}</div>
	                <div class="demand color:base-5 text-align:center">${m.demandPrediction}</div>
                    <div class="toggle d:flex flex:col justify-content:center align-items:center">
                        <span class="h:25px font-size:3 color:main-1">${m.changeStatus}</span>
                        <span class="h:25px font-size:0 color:base-5">${m.changeRate}</span>
                    </div>
        		</div>
		    `;
			productListSection.insertAdjacentHTML("beforeend", template);
		}
		
		const products = productListSection.querySelectorAll(".product");
		
		// 제품 클릭 시 상태 변경
        products.forEach(product => {
            product.addEventListener("click", function() {
                // 모든 다른 요소를 순회하며 클래스 변경
                products.forEach(otherProduct => {
                    if (otherProduct !== product) {
                        otherProduct.classList.remove("clicked");
                        otherProduct.classList.add("non-clicked");
                    }
                });

                // 현재 클릭된 요소의 클래스 변경
                if (product.classList.contains("clicked")) {
                    product.classList.remove("clicked");
                    product.classList.add("non-clicked");
                } else {
                    product.classList.remove("non-clicked");
                    product.classList.add("clicked");
                }
            });
        });
	});
	
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
