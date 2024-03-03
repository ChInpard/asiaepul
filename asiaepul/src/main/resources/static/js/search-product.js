window.addEventListener("load", function() {
	const predictionSection = document.querySelector(".prediction-section");
	
	const productSearchForm = predictionSection.querySelector(".prediction-list .product-form");
	const productSearchInput = productSearchForm.querySelector(".input-box .search-input");
	const productList = predictionSection.querySelector(".product-list");
	const productListSection = productList.querySelector(".contents");
	
	const categoryButton = predictionSection.querySelector(".icon-category");
	
	const nameSortButton = productList.querySelector(".product-name .icon-filter");
	const demandSortButton = productList.querySelector(".demand .icon-filter");
	const varianceSortButton = productList.querySelector(".variance .icon-filter");
	
	categoryButton.addEventListener("click", async() => {
	    
	    const popupContainer = document.querySelector(".popup-container");
	    const searchText = popupContainer.querySelector(".popup .search-text");
	    const categoryList = popupContainer.querySelector(".popup .popup-contents");
	    
	    // 팝업 컨테이너를 보이도록 설정
	    popupContainer.style.display = 'block';
	    
	    /** icon-filter 클릭 시 보여지는 로직 */
	    await searchCategories();
	   	
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
			        
			        searchText.value = ""; // 검색 텍스트 초기화
				    categoryList.innerHTML = ""; // 카테고리 목록 초기화
				    
				    // 팝업 컨테이너를 숨김 상태로 변경
				    popupContainer.style.display = 'none';
			        
					await searchProducts(clickedCategory);
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
                	<input type="hidden" value="${m.id}">
                    <div class="product-name color:base-5">${m.name}</div>
	                <div class="demand color:base-5 text-align:center">${formattedDemandPrediction}</div>
                    <div class="variance d:flex flex:col justify-content:center align-items:center">
                        <span class="h:25px font-size:3 color:${statusColor}">${m.changeStatus}</span>
                        <span class="h:25px font-size:0 color:base-5"><span>${plusOrMinus}</span><span class="abs">${m.changeRate}</span>%</span>
                    </div>
        		</div>
		    `;
			productListSection.insertAdjacentHTML("beforeend", template);
		}
		productListSection.scrollTo({
	        top: 0,
	        behavior: "smooth"
	    });
		const products = productListSection.querySelectorAll(".product");
		changeStatus(products);
	}
		
		
	// 제품 클릭 시 상태 변경
	function changeStatus(objList) {
	    objList.forEach(obj => {
	        // 이미 클릭된 요소는 클릭 이벤트를 추가하지 않음
	        if (!obj.classList.contains("clicked")) {
	            obj.addEventListener("click", async function() {
	                const productName = obj.querySelector(".product-name").textContent;
	                const productId = obj.querySelector(".product input").value;
	                // 현재 클릭된 요소가 이미 clicked 클래스를 가지고 있는지 확인
	                const isClicked = obj.classList.contains("clicked");
	                
	                // 오버레이 추가: 로딩 중 메시지 표시
	                const loadingOverlay = document.querySelector(".product-prediction .loading-overlay");
	                loadingOverlay.classList.add("active");
	
	                // 모든 다른 요소를 순회하며 클래스 변경
	                objList.forEach(otherObj => {
	                    if (otherObj !== obj) {
	                        otherObj.classList.remove("clicked");
	                        otherObj.classList.add("non-clicked");
	                    }
	                });
	                
	                console.log(productName);
	                console.log(productId);
	                
	
	                // 현재 클릭된 요소가 clicked 클래스를 가지고 있지 않은 경우에만 클래스 변경
	                if (!isClicked) {
	                    obj.classList.remove("non-clicked");
	                    obj.classList.add("clicked");
	                }
	                
	                await getAnalysisData(productId);
	                
	                // 오버레이 제거: 로딩 완료
	                loadingOverlay.classList.remove("active");
	            });
	        }
	    });
	}


    
    
    async function getAnalysisData(productId) {
		const url = `http://localhost:8000/analysis/${productId}`;
		const response = await fetch(url);
	    const analysisData = await response.json();
	    console.log(analysisData);
	    
	    const modelName = predictionSection.querySelector(".AI-apply dl .model-name");
	    const modelRank = predictionSection.querySelector(".AI-apply dl .rank");
	    const modelCount = predictionSection.querySelector(".AI-apply dl .model-count");
	    const modelRate = predictionSection.querySelector(".AI-apply dl .rate");
	    const modelSelectButton = predictionSection.querySelectorAll(".analysis-select .analysis-model");
	    
	    let model = analysisData.resultModelOne;
	    
        // 모델 이름 설정
        modelName.innerHTML = Object.keys(analysisData)[0];

        // 모델 개수 설정
        let modelCountValue = Object.keys(analysisData).length;
        modelCount.innerHTML = modelCountValue;

        // 예측 정확도 설정
        let modelRateValue = analysisData.resultModelOne.accuracy;
        modelRate.innerHTML = `${modelRateValue} %`;

        // 정렬된 모델 리스트 생성
        let sortedModelList = Object.keys(analysisData).sort((a, b) => {
            return analysisData[b].rate - analysisData[a].rate; // 예측 정확도를 기준으로 내림차순 정렬
        });

        // 해당 모델의 순위 찾기
        const modelRankValue = sortedModelList.indexOf("resultModelOne") + 1;
        modelRank.innerHTML = `${modelRankValue}`;
	    
	    
	    let productName = predictionSection.querySelector(".product-prediction .product-name");
	    productName.innerHTML = model.productName;
	    
	    let realData = model.actualVolume;
	    let demandData = model.demandForecast;
	    let dates = model.dates;
	    
	    drawChart(realData, demandData, dates);
	    
	    // 각 모델 선택 버튼에 대한 클릭 이벤트 리스너 추가
	    modelSelectButton.forEach((button, index) => {
	        button.addEventListener("click", async () => {
	            // 모델을 선택된 모델로 설정
		        const selectedModel = index === 0 ? Object.keys(analysisData)[0] : Object.keys(analysisData)[1];
		        
		        // 모델 이름 설정
		        modelName.innerHTML = selectedModel;
		        
		        // 예측 정확도 설정
		        const modelRateValue = analysisData[selectedModel].accuracy;
		        modelRate.innerHTML = `${modelRateValue} %`;
		        
		        // 정렬된 모델 리스트 생성
		        let sortedModelList = Object.keys(analysisData).sort((a, b) => analysisData[b].rate - analysisData[a].rate); // 예측 정확도를 기준으로 내림차순 정렬
		        
		        // 해당 모델의 순위 찾기
		        const modelRankValue = sortedModelList.indexOf(selectedModel) + 1;
		        modelRank.innerHTML = `${modelRankValue}`;
	            
	            
	            // 새로운 모델 데이터로 차트 다시 그리기
	            realData = model.actualVolume;
	            demandData = model.demandForecast;
	            dates = model.dates;
	            
	            await drawChart(realData, demandData, dates);
	        });
	    });
		
	    /** 그래프 */
	    async function drawChart(realData, demandData, dates) {
		    const dom = document.getElementById('product-prediction-chart');
		    const myChart = echarts.init(dom, null, {
		        renderer: 'canvas',
		        useDirtyRect: false,
		        height: 460
		    });
		
		    const series = [
		        {
		            "name": "실제 수요",
		            "type": "line",
		            "data": realData,
		            "color": '#2D68FE'
		        },
		        {
		            "name": "예측 수요",
		            "type": "line",
		            "data": demandData,
		            "color": 'rgba(73, 211, 70, 0.6)'
		        }
		    ];
		
		    const option = {
		        tooltip: {
		            trigger: 'axis',
		            axisPointer: {
		                type: 'cross',
		                crossStyle: {
		                    color: '#999'
		                }
		            }
		        },
		        toolbox: {
		            feature: {
		                dataView: { show: true, readOnly: true },
		                magicType: { show: true, type: ['line', 'bar'] },
		                restore: { show: true },
		                saveAsImage: { show: true }
		            }
		        },
		        legend: {
		            data: series.map(s => s.name)  // 동적으로 범례 데이터 설정
		        },
		        xAxis: [
		            {
		                type: 'category',
		                data: dates,
		                axisPointer: {
		                    type: 'shadow'
		                }
		            }
		        ],
		        yAxis: [
		            {
		                type: 'value',
		                name: '',
		                axisLabel: {
		                    margin: 10
		                }
		            }
		        ],
		        dataZoom: [
		            {
		              type: 'inside',
		              start: 70,
		              end: 100
		            },
		            {
		              start: 70,
		              end: 100
		            }
		        ],
		        series: series.map(s => ({
		            ...s,
		            tooltip: {
		                valueFormatter: function(value) {
		                return value + ' ea';  // 단위
		                }
		            },
		            symbol: 'none'
		        }))
		    };
		
		    myChart.setOption(option);
		
		    window.addEventListener('resize', myChart.resize);
		}
	}
    
        
	// 각각의 정렬 방식을 저장하는 변수
	let currentSortMethod = ""; // 현재 선택된 정렬 방식
	let nameSortDirection = "desc"; // 제품명 정렬 방식
	let demandSortDirection = "asc"; // 수요예측량 정렬 방식
	let varianceSortDirection = "asc"; // 증감률 정렬 방식
	
	// 제품명 정렬 버튼 클릭 시
	nameSortButton.addEventListener("click", function() {
		if (currentSortMethod !== "name") {
	        currentSortMethod = "name";
	        demandSortDirection = "asc"; // 다른 정렬 방식 초기화
	        varianceSortDirection = "asc";
	    }
	    // 정렬 방식 토글
	    nameSortDirection = nameSortDirection === "asc" ? "desc" : "asc";
	    // 목록 정렬
	    sortProductListByName();
	    productListSection.scrollTo({
	        top: 0,
	        behavior: "smooth"
	    });
	});
	
	// 수요예측량 정렬 버튼 클릭 시
	demandSortButton.addEventListener("click", function() {
		if (currentSortMethod !== "demand") {
	        currentSortMethod = "demand";
	        nameSortDirection = "desc"; // 다른 정렬 방식 초기화
	        varianceSortDirection = "asc";
	    }
	    // 정렬 방식 토글
	    demandSortDirection = demandSortDirection === "asc" ? "desc" : "asc";
	    // 목록 정렬
	    sortProductListByDemand();
	    productListSection.scrollTo({
	        top: 0,
	        behavior: "smooth"
	    });
	});
	
	// 증감률 정렬 버튼 클릭 시
	varianceSortButton.addEventListener("click", function() {
		if (currentSortMethod !== "variance") {
	        currentSortMethod = "variance";
	        nameSortDirection = "desc"; // 다른 정렬 방식 초기화
	        demandSortDirection = "asc";
	    }
	    // 정렬 방식 토글
	    varianceSortDirection = varianceSortDirection === "asc" ? "desc" : "asc";
	    // 목록 정렬
	    sortProductListByVariance();
	    productListSection.scrollTo({
	        top: 0,
	        behavior: "smooth"
	    });
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
	
	// 증감률로 정렬하는 함수
	function sortProductListByVariance() {
	    const products = productList.querySelectorAll(".product");
	    let sortedProducts;
	    if (varianceSortDirection === "asc") {
	        sortedProducts = sortProductsByVarianceAsc(products);
	    } else {
	        sortedProducts = sortProductsByVarianceDesc(products);
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
	
	// 수요예측량으로 오름차순 정렬하는 함수
	function sortProductsByDemandAsc(products) {
	    const sortedProducts = Array.from(products).sort((a, b) => {
	        const demandA = parseInt(a.querySelector(".demand").textContent.replace(/,/g, ''));
	        const demandB = parseInt(b.querySelector(".demand").textContent.replace(/,/g, ''));
	        return demandA - demandB;
	    });
	    return sortedProducts;
	}
	
	// 수요예측량으로 내림차순 정렬하는 함수
	function sortProductsByDemandDesc(products) {
	    const sortedProducts = Array.from(products).sort((a, b) => {
	        const demandA = parseInt(a.querySelector(".demand").textContent.replace(/,/g, ''));
	        const demandB = parseInt(b.querySelector(".demand").textContent.replace(/,/g, ''));
	        return demandB - demandA;
	    });
	    return sortedProducts;
	}

	// 증감률로 오름차순 정렬하는 함수
	function sortProductsByVarianceAsc(products) {
	    const sortedProducts = Array.from(products).sort((a, b) => {
	        // a와 b의 수요예측량을 비교하여 오름차순으로 정렬
	        const varianceA = parseFloat(a.querySelector(".variance .abs").textContent);
	        const varianceB = parseFloat(b.querySelector(".variance .abs").textContent);
	        return varianceA - varianceB;
	    });
	    return sortedProducts;
	}
	
	// 증감률로 내림차순 정렬하는 함수
	function sortProductsByVarianceDesc(products) {
	    const sortedProducts = Array.from(products).sort((a, b) => {
	        // a와 b의 수요예측량을 비교하여 내림차순으로 정렬
	        const varianceA = parseFloat(a.querySelector(".variance .abs").textContent);
	        const varianceB = parseFloat(b.querySelector(".variance .abs").textContent);
	        return varianceB - varianceA;
	    });
	    return sortedProducts;
	}

});
