package store.asiaepul.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.RestTemplate;

import store.asiaepul.entity.DataModel;

@Controller
public class DashboardController {

    @Autowired
    private RestTemplate restTemplate; // REST API 호출을 위한 RestTemplate 사용

    @GetMapping
    public String index(Model model) {
    	
    	Map<String, String> apiUrls = new HashMap<>();
    	apiUrls.put("http://localhost:8000/variance", "var");
    	apiUrls.put("http://localhost:8000/best-category", "cate");
    	apiUrls.put("http://localhost:8000/best-product", "prod");
    	apiUrls.put("http://localhost:8000/best-mart", "mart");
    	apiUrls.put("http://localhost:8000/peaktime", "peak");

    	for (Map.Entry<String, String> entry : apiUrls.entrySet()) {
    	    String url = entry.getKey();
    	    String attribute = entry.getValue();
    	    
    	    DataModel data = restTemplate.getForObject(url, DataModel.class);
    	    model.addAttribute(attribute, data);
    	}

        return "index";
    }
    
    @GetMapping("prediction")
    public String prediction(Model model) {

        return "prediction";
    }
    
}