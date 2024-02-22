package store.asiaepul.entity;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DataModel {
	
	private String variance;
	private String category;
	private String product;
	private String mart;
	private String peakTime;
	private List<ProgressData> progressData;
	
	@Getter
	@Setter
	public static class ProgressData {
		private String title;
		private float value;
	}
}
