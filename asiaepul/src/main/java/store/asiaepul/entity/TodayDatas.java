package store.asiaepul.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TodayDatas {
	
	private String today;
	private String variance;
	private String bestCategory;
	private String worstCategory;
	private String bestProduct;
	private String worstProduct;
	private String peakTime;
	private String offPeakTime;
}
