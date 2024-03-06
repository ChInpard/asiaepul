package store.asiaepul.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;

import store.asiaepul.entity.TodayDatas;

@Controller
public class DashboardController {

    @Autowired
    private RestTemplate restTemplate; // REST API 호출을 위한 RestTemplate 사용

    @GetMapping
    public String index(Model model) {
    	
    	Map<String, String> apiUrls = new HashMap<>();
    	apiUrls.put("http://localhost:8000/today-date", "td");
    	apiUrls.put("http://localhost:8000/variance", "var");
    	apiUrls.put("http://localhost:8000/best-category", "bc");
    	apiUrls.put("http://localhost:8000/worst-category", "wc");
    	apiUrls.put("http://localhost:8000/best-product", "bp");
    	apiUrls.put("http://localhost:8000/worst-product", "wp");
    	apiUrls.put("http://localhost:8000/peaktime", "p");
    	apiUrls.put("http://localhost:8000/off-peaktime", "op");

    	for (Map.Entry<String, String> entry : apiUrls.entrySet()) {
    	    String url = entry.getKey();
    	    String attribute = entry.getValue();
    	    
    	    TodayDatas data = restTemplate.getForObject(url, TodayDatas.class);
    	    model.addAttribute(attribute, data);
    	}

        return "index";
    }
    
    @GetMapping("prediction")
    public String prediction(Model model) {

        return "prediction";
    }
    
}