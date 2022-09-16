package io.confluent.demo.fleetmgt.model;

public class CarTrackingInfo {
	private double latitude;
	private double longitude;
	
	public CarTrackingInfo() {
		super();
	}

	public CarTrackingInfo(double latitude, double longitude) {
		super();
		this.latitude = latitude;
		this.longitude = longitude;
	}
	
	public double getLatitude() {
		return latitude;
	}

	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}
	
	public double getLongitude() {
		return longitude;
	}
	
	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}
	
}
