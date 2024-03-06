document.addEventListener("DOMContentLoaded", function() {
    const salesTrendChartSection = document.getElementById('sales-trend-chart');
    const salesTrendChart = echarts.init(salesTrendChartSection, null, {
        renderer: 'canvas',
        useDirtyRect: false,
        height: 260
    });

    async function drawChart() {
		// FastAPI 판매량 증감 추이 url
		const url = 'http://localhost:8000/sales-trend';
		
		const response = await fetch(url);
		const chartData = await response.json();
		console.log(chartData);
		
		chartData.categories.unshift("9:00");
		chartData.series.unshift(0);
		
	    const option = {
			color: ['rgba(255, 2, 2, 0.7)'],
	        tooltip: {
	            trigger: 'axis'
	        },
	        toolbox: {
	            feature: {
	                dataView: { show: true, readOnly: true },
	                magicType: { show: true, type: ['line', 'bar'] },
	                saveAsImage: { show: true }
	            }
	        },
	        xAxis: {
	            type: 'category',
	            boundaryGap: false,
	            data: chartData.categories,
	            name: "시간대",
	            nameLocation: 'middle',
	            nameGap: 40,
	            axisLabel: {
                    interval: 1,
                }
	        },
	        yAxis: {
	            type: 'value',
	            name: "판매량",
	            nameLocation: 'end',
	            nameGap: 25,
	            axisLabel: {
                    margin: 10
                }
	        },
	        series: [
	            {
					name: '전체 판매량',
	                data: chartData.series,
	                type: 'line',
	                // symbol: 'fill',
	            }
	        ]
	    };
	
	    if (option && typeof option === 'object') {
	        salesTrendChart.setOption(option);
	    }
    };
    
    drawChart();

    window.addEventListener('resize', salesTrendChart.resize);

});
