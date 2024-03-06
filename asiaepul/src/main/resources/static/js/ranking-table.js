window.addEventListener("load", function (){
	const graphTableSection = document.querySelector(".graph-table");
	const salesProductTableHead = graphTableSection.querySelector(".sales-product-rank table thead");
	const salesProductTableBody = graphTableSection.querySelector(".sales-product-rank table tbody");
	const rapidChaigingSalesTableHead = graphTableSection.querySelector(".rapid-changing-sales table thead");
	const rapidChaigingSalesTableBody = graphTableSection.querySelector(".rapid-changing-sales table tbody");
	
	const salesTableDropdown = graphTableSection.querySelector(".sales-product-rank .dropdown");
	const salesDropButton = salesTableDropdown.querySelector("button");
	const salesDropdownOptions = salesTableDropdown.querySelector(".dropdown-options")
	
	const rapidTableDropdown = graphTableSection.querySelector(".rapid-changing-sales .dropdown");
	const rapidDropButton = rapidTableDropdown.querySelector("button");
	const rapidDropdownOptions = rapidTableDropdown.querySelector(".dropdown-options")
	
	const salesSelectedValues = salesTableDropdown.querySelectorAll(".option");
	const rapidSelectedValues = rapidTableDropdown.querySelectorAll(".option");
	
	getSalesRankTable(1);
	getRapidSalesRankTable(1);
    
    salesDropButton.addEventListener("click", async () => {
	    if (salesDropdownOptions.classList.contains("d:none")) {
	        salesDropdownOptions.classList.remove("d:none");
	    } else {
	        salesDropdownOptions.classList.add("d:none");
	        salesSelectedValues.forEach((salesSelectedValue) => {
	            salesSelectedValue.classList.add("d:none");
	        });
	    }
	
	    salesSelectedValues.forEach((salesSelectedValue, index) => {
	        salesSelectedValue.addEventListener("click", async () => {
	            const selectedValue = index + 1;
	            await getSalesRankTable(selectedValue);
	            salesDropdownOptions.classList.add("d:none");
	        });
	    });
	});
    
    rapidDropButton.addEventListener("click", async () => {
	    if (rapidDropdownOptions.classList.contains("d:none")) {
	        rapidDropdownOptions.classList.remove("d:none");
	    } else {
	        rapidDropdownOptions.classList.add("d:none");
	        rapidSelectedValues.forEach((rapidSelectedValue) => {
	            rapidSelectedValue.classList.add("d:none");
	        });
	    }
	
	    rapidSelectedValues.forEach((rapidSelectedValue, index) => {
	        rapidSelectedValue.addEventListener("click", async () => {
	            const selectedValue = index + 1;
	            await getRapidSalesRankTable(selectedValue);
	            rapidDropdownOptions.classList.add("d:none");
	        });
	    });
	});

	
	async function getSalesRankTable(selectedValue){
		
		let url;
	    if (selectedValue == 1) {
	        url = 'http://localhost:8000/sales-volume-top';
	    } else if (selectedValue == 2) {
	        url = 'http://localhost:8000/sales-volume-bottom';
	    }
		
	    const response = await fetch(url);
	    const tableData = await response.json();
	    console.log(tableData);
	    
	    salesProductTableHead.innerHTML = ''; // Clear table head
    	salesProductTableBody.innerHTML = ''; // Clear table body
    	
	    salesProductTableHead.insertAdjacentHTML("beforeend", `
	    	<tr class="bg-color:main-1">
                <th class="w:8% text-align:center" style="width: 7%;">순위</th>
                <th class="w:35% text-align:center" style="width: 35%;">상품군</th>
                <th class="w:35% text-align:center" style="width: 45%;">상품</th>
                <th class="text-align:center style="width: 13%;"">판매량</th>
            </tr>
	    `);
	    
	    for (let i=0; i<5; i++) {
		    let template = `
	            <tr>
	                <td class="text-align:center">${tableData[i].rank}</td>
	                <td class="text-align:center">${tableData[i].category}</td>
	                <td class="text-align:center">${tableData[i].product}</td>
	                <td class="text-align:center">${tableData[i].amount}</td>
	            </tr>
		    `;
		    
		salesProductTableBody.insertAdjacentHTML("beforeend", template);
		}
	}
	
	async function getRapidSalesRankTable(selectedValue){
		
		let url;
	    if (selectedValue == 1) {
	        url = 'http://localhost:8000/rapid-increase';
	    } else if (selectedValue == 2) {
	        url = 'http://localhost:8000/rapid-decrease';
	    }
		
	    const response = await fetch(url);
	    const tableData = await response.json();
	    console.log(tableData);
	    
	    rapidChaigingSalesTableHead.innerHTML = ''; // Clear table head
    	rapidChaigingSalesTableBody.innerHTML = ''; // Clear table body
    
	    rapidChaigingSalesTableHead.insertAdjacentHTML("beforeend", `
	    	<tr class="bg-color:accent-1">
                <th class="text-align:center" style="width: 7%;">순위</th>
                <th class="text-align:center" style="width: 22%;">상품군</th>
                <th class="text-align:center" style="width: 33%;">상품</th>
                <th class="text-align:center" style="width: 10%;">전일</th>
                <th class="text-align:center" style="width: 10%;">금일</th>
                <th class="text-align:center" style="width: 18%;">판매 증감률</th>
            </tr>
	    `);
	    
	    for (let i=0; i<5; i++) {
			let statusColor = tableData[i].status === "▲" ? "main-1" : "main-2";
			
		    let template = `
	            <tr>
	                <td class="text-align:center">${tableData[i].rank}</td>
	                <td class="text-align:center">${tableData[i].category}</td>
	                <td class="text-align:center">${tableData[i].product}</td>
	                <td class="text-align:center">${tableData[i].yesterdayTotal}</td>
	                <td class="text-align:center">${tableData[i].todayTotal}</td>
	                <td class="text-align:center"><span class="color:${statusColor}">${tableData[i].status}</span> ${tableData[i].changeRate}</td>
	            </tr>
		    `;
		    
		rapidChaigingSalesTableBody.insertAdjacentHTML("beforeend", template);
		}
	}
	
})