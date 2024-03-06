window.addEventListener("load", function() {
	const predictionSection = document.querySelector(".prediction-section");
	
	const productSearchForm = predictionSection.querySelector(".prediction-list .product-form");
	const productSearchInput = productSearchForm.querySelector(".input-box .search-input");
	const productList = predictionSection.querySelector(".product-list");
	const productListSection = productList.querySelector(".contents");
	
	const categoryButton = predictionSection.querySelector(".icon-category");
	
	const nameSortButton = productList.querySelector(".product-name .icon-filter");
	
	categoryButton.addEventListener("click", async() => {
	    
	    const popupContainer = document.querySelector(".popup-container");
	    //const searchText = popupContainer.querySelector(".popup .search-text");
	    const categoryList = popupContainer.querySelector(".popup .popup-contents");
	    
	    // 팝업 컨테이너를 보이도록 설정
	    popupContainer.style.display = 'block';
	    
	    /** icon-filter 클릭 시 보여지는 로직 */
	    await searchCategories();
	   	
		/** 카테고리 검색 조회 로직 */
		/*const categorySearchInput = popupContainer.querySelector(".popup .search-input");
		categorySearchInput.addEventListener("click", async() => {
		    await searchCategories();
		});
		const categorySearchText = popupContainer.querySelector(".popup .search-text");
		categorySearchText.addEventListener("keydown", async(e) => {
		    if (e.key === 'Enter') {
		        await searchCategories();
		    }
		});*/
		
		async function searchCategories() {
		    //const query = searchText.value.trim();
		    
		    const url = `http://localhost:8000/products?query=`;
		    const response = await fetch(url);
		    const categoriesData = await response.json();
		    console.log(categoriesData);
		    
		    categoryList.innerHTML = "";
			for (let category of categoriesData) {
				let template = `
					<div class="content">
						<input type="hidden" value="${category.id}">
						${category.name}
					</div>
				`;
				categoryList.insertAdjacentHTML("beforeend", template);
			}
			// 각 카테고리에 클릭 이벤트 리스너
			const categories = categoryList.querySelectorAll(".content");
			categories.forEach(category => {
			    category.addEventListener("click", async() => {
			        const clickedCategory = category.textContent;
			        const clickedCategoryId = category.querySelector('input').value;
			        console.log(clickedCategory);
			        console.log(clickedCategoryId);
			        
			        //searchText.value = ""; // 검색 텍스트 초기화
				    categoryList.innerHTML = ""; // 카테고리 목록 초기화
				    
				    // 팝업 컨테이너를 숨김 상태로 변경
				    popupContainer.style.display = 'none';
			        
			        // 오버레이 추가: 로딩 중 메시지 표시
	                const loadingOverlay = document.querySelector(".product-prediction .loading-overlay");
	                loadingOverlay.classList.add("active");
	                
					productListSection.innerHTML = "";
					let template = `
		                <div class="product d:flex align-items:center clicked">
		                	<input type="hidden" value="${clickedCategoryId}">
		                    <div class="product-name color:base-5">${clickedCategory}</div>
		        		</div>
				    `;
				    productListSection.insertAdjacentHTML("beforeend", template);
				    
					await getAnalysisData(clickedCategoryId);
					changeStatus(categories);
					
					// 오버레이 제거: 로딩 완료
	                loadingOverlay.classList.remove("active");
			    });
			});
            
		}
		
	});
	
	// 팝업 닫기 버튼 클릭 시
	const popupCloseButton = document.querySelector(".popup-close");
	popupCloseButton.addEventListener("click", function() {
	    const popupContainer = document.querySelector(".popup-container");
	    const categoryList = popupContainer.querySelector(".popup .popup-contents");
	    /*const searchText = popupContainer.querySelector(".popup .search-text");
	    
	    searchText.value = ""; // 검색 텍스트 초기화*/
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
			url = `http://localhost:8000/products?query=${category}`;
	    } else {
			url = `http://localhost:8000/products?query=${query}`;
		}
    	const response = await fetch(url);
		const productsData = await response.json();
		console.log(productsData);
		
		productListSection.innerHTML = "";
		for (let m of productsData) {
			let template = `
                <div class="product d:flex align-items:center">
                	<input type="hidden" value="${m.id}">
                    <div class="product-name color:base-5">${m.name}</div>
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
		let url = `http://localhost:8000/analysis/${productId}`;
		const response = await fetch(url);
	    const analysisData = await response.json();
	    console.log(analysisData);
	    
	    
	    let modelName = predictionSection.querySelector(".AI-apply dl .model-name");
	    let sumReal = predictionSection.querySelector(".AI-apply dl .real");
	    let sumPred = predictionSection.querySelector(".AI-apply dl .pred");
	   	
	    let mae = predictionSection.querySelector(".AI-figure dl .mae");
	    let rmse = predictionSection.querySelector(".AI-figure dl .rmsd");
	    let mape = predictionSection.querySelector(".AI-figure dl .mape");
	    let modelSelectButton = predictionSection.querySelectorAll(".analysis-select .analysis-model");
	    
	    let model = analysisData;
	    
	    let totalReal = 0;
	    for (let i = 0; i < model[0].realData.length; i++) {
		    totalReal += model[0].realData[i];
		}
		
		let totalPred = 0;
	    for (let i = 0; i < model[0].predicData.length; i++) {
		    totalPred += model[0].predicData[i];
		}
    	
    	modelName.innerHTML = model[0].modelName;
    	sumReal.innerHTML = totalReal;
    	sumPred.innerHTML = totalPred;
    	
    	mae.innerHTML = model[0].mae;
    	rmse.innerHTML = model[0].rmse;
    	mape.innerHTML = model[0].mape;
	    
	    
	    let productName = predictionSection.querySelector(".product-prediction .product-name");
	    productName.innerHTML = model[0].category;
	    
	    let realData = model[0].realData;
	    let demandData = model[0].predicData;
	    let dates = model[0].dates;
	    
	    //let standardY = totalReal > totalPred ? totalReal : totalPred;
	    let standardY = (totalReal + totalPred) / 2;
	    console.log(standardY);
	    let graphFrame = 0;
		if (standardY < 300) {
			graphFrame = 50;
	    } else if (standardY < 350) {
			graphFrame = 80;
		} else if (standardY < 400) {
			graphFrame = 100;
		} else if (standardY < 500) {
			graphFrame = 150;
		} else if (standardY < 1000) {
			graphFrame = 200;
		} else if (standardY < 2000) {
			graphFrame = 400;
		} else if (standardY < 2500) {
			graphFrame = 500;
		} else if (standardY < 3500) {
			graphFrame = 700;
		} else if (standardY < 4000) {
			graphFrame = 800;
		} else if (standardY < 5000) {
			graphFrame = 1000;
		} else if (standardY < 6000) {
			graphFrame = 1200;
		} else if (standardY < 10000) {
			graphFrame = 1500;
		} else if (standardY < 15000) {
			graphFrame = 2000;
		} else if (standardY < 20000) {
			graphFrame = 3000;
		} else if (standardY < 30000) {
			graphFrame = 5000;
		} else if (standardY < 60000) {
			graphFrame = 10000;
		}
	    
	    drawChart(realData, demandData, dates, graphFrame);
	    
	    // 각 모델 선택 버튼에 대한 클릭 이벤트 리스너 추가
		modelSelectButton.forEach((button, index) => {
		    button.addEventListener("click", async () => {
		        // 모델을 선택된 모델로 설정
		        const selectedModel = index + 1;
		        // 선택된 모델 데이터로 설정
		        model = analysisData[selectedModel - 1];
		        
		        let totalReal = 0;
			    for (let i = 0; i < model.realData.length; i++) {
				    totalReal += model.realData[i];
				}
				
				let totalPred = 0;
			    for (let i = 0; i < model.predicData.length; i++) {
				    totalPred += model.predicData[i];
				}
		    	
		    	modelName.innerHTML = model.modelName;
		    	sumReal.innerHTML = totalReal;
		    	sumPred.innerHTML = totalPred;
    	
		        mae.innerHTML = model.mae;
		    	rmse.innerHTML = model.rmse;
		    	mape.innerHTML = model.mape;
		        
		        // 새로운 모델 데이터로 차트 다시 그리기
		        const newRealData = model.realData;
		        const newDemandData = model.predicData;
		        const newDates = model.dates;
		        
		        drawChart(newRealData, newDemandData, newDates, graphFrame);
		    });
		});
		
	    /** 그래프 */
	    async function drawChart(realData, demandData, dates, graphFrame) {
		    const dom = document.getElementById('product-prediction-chart');
		    
		    if (window.myChart != undefined) {
            window.myChart.dispose();
         	}
	         window.myChart = echarts.init(dom, null, {
	            renderer: 'canvas',
	            useDirtyRect: false,
	            height: 460
			})
			
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
		                    margin: 10,
		                    interval: 1
		                },
		                // y축 범위 고정
		                min: 0,  // 최소값 설정
		                max: graphFrame // 최대값 설정
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
	
	// 제품명 정렬 버튼 클릭 시
	nameSortButton.addEventListener("click", function() {
		if (currentSortMethod !== "name") {
	        currentSortMethod = "name";
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


});
