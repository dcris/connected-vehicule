package io.confluent.demo.fleetmgt.model;

public class CarDeliveryStatusEvent extends CarTrackingInfo {
	private boolean delivered;
	private long timeSpent;
	public boolean isDelivered() {
		return delivered;
	}
	public void setDelivered(boolean delivered) {
		this.delivered = delivered;
	}
	public long getTimeSpent() {
		return timeSpent;
	}
	public void setTimeSpent(long timeSpent) {
		this.timeSpent = timeSpent;
	}
}
