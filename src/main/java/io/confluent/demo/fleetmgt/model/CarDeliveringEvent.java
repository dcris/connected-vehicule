package io.confluent.demo.fleetmgt.model;

public class CarDeliveringEvent extends CarTrackingInfo {
	private boolean delivering;

	public boolean isDelivering() {
		return delivering;
	}

	public void setDelivering(boolean delivering) {
		this.delivering = delivering;
	}
	
}
