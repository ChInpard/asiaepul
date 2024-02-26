window.addEventListener("load", function (){
	const graphTableSection = document.querySelector(".graph-table");
	const salesProductTableHead = graphTableSection.querySelector(".sales-product-rank table thead");
	const salesProductTableBody = graphTableSection.querySelector(".sales-product-rank table tbody");
	const rapidChaigingSalesTableHead = graphTableSection.querySelector(".rapid-changing-sales table thead");
	const rapidChaigingSalesTableBody = graphTableSection.querySelector(".rapid-changing-sales table tbody");
	
	getSalesRankTable();
	getRapidSalesRankTable();
	
	
	async function getSalesRankTable(){
		const url = 'http://localhost:8000/sales-volume';
		
	    const response = await fetch(url);
	    const tableData = await response.json();
	    console.log(tableData);
	    
	    salesProductTableHead.insertAdjacentHTML("beforeend", `
	    	<tr class="bg-color:main-1">
                <th class="w:8% text-align:center">순위</th>
                <th class="w:35% text-align:center">식품군</th>
                <th class="w:35% text-align:center">식품</th>
                <th class="text-align:center">판매량</th>
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
	
	async function getRapidSalesRankTable(){
		const url = 'http://localhost:8000/rapid-change';
		
	    const response = await fetch(url);
	    const tableData = await response.json();
	    console.log(tableData);
	    
	    rapidChaigingSalesTableHead.insertAdjacentHTML("beforeend", `
	    	<tr class="bg-color:accent-1">
                <th class="w:8% text-align:center">순위</th>
                <th class="w:35% text-align:center">식품군</th>
                <th class="w:35% text-align:center">식품</th>
                <th class="text-align:center">증감률</th>
            </tr>
	    `);
	    
	    for (let i=0; i<5; i++) {
		    let template = `
	            <tr>
	                <td class="text-align:center">${tableData[i].rank}</td>
	                <td class="text-align:center">${tableData[i].category}</td>
	                <td class="text-align:center">${tableData[i].product}</td>
	                <td class="text-align:center">${tableData[i].changeRate}</td>
	            </tr>
		    `;
		    
		rapidChaigingSalesTableBody.insertAdjacentHTML("beforeend", template);
		}
	}
	
})