package io.confluent.demo.fleetmgt.model;

public class CarTrackingInfo {
	private String driverID;
	private double[] coordinate;
	
	public CarTrackingInfo() {
		super();
	}
	
	public String getDriverID() {
		return driverID;
	}

	public void setDriverID(String driverID) {
		this.driverID = driverID;
	}
	
	public double[] getCoordinate() {
		return coordinate;
	}

	public void setCoordinate(double[] coordinate) {
		this.coordinate = coordinate;
	}
	
}
