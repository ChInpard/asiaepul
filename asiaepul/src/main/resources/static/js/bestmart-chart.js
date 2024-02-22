document.addEventListener('DOMContentLoaded', function() {
    const bestMartChartSection = document.getElementById('bestmart-chart');
    const bestMartChart = echarts.init(bestMartChartSection, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });
    
    async function drawChart() {
		// FastAPI 마트 실적 순위 url
		const url = 'http://localhost:8000/mart-rank';
		
		const response = await fetch(url);
		const chartData = await response.json();
		
	    const option = {
			toolbox: {
	            feature: {
	                dataView: { show: true, readOnly: false },
	                saveAsImage: { show: true }
	            }
	        },
	        xAxis: {
	            type: 'value',
	            name: '판매량',
	            nameLocation: 'middle',
	            nameGap: 35
	        },
	        yAxis: {
	            type: 'category',
	            data: chartData.categories,
	            name: '지점',
	            nameLocation: 'end'
	        },
	        series: [
	            {
	                data: chartData.series,
	                type: 'bar',
	                label: {
	                    show: true,
	                    position: 'inside',
	                    formatter: '{c}'
	                }
	            }
	        ]
	    };
	
	    if (option && typeof option === 'object') {
	        bestMartChart.setOption(option);
	    }
    };
    
    drawChart();

    window.addEventListener('resize', bestMartChart.resize);
});
