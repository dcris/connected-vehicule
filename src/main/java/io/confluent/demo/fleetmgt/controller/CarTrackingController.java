package io.confluent.demo.fleetmgt.controller;

import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import com.github.javafaker.Faker;
import com.opencsv.CSVReader;

import io.confluent.demo.fleetmgt.model.CarDeliveringEvent;
import io.confluent.demo.fleetmgt.model.CarDeliveryStatusEvent;
import io.confluent.demo.fleetmgt.model.CarTrackingInfo;

//@EnableScheduling
@Controller
public class CarTrackingController {
	
	@Autowired
    private SimpMessagingTemplate template;
	
	private final Faker faker = new Faker(new Locale("en-US"));
//	private final List<CarTrackingInfo> data = Arrays.asList(new CarTrackingInfo(48.831081, 2.0770324),
//            new CarTrackingInfo(48.8255436,2.125355),
//            new CarTrackingInfo(48.7967555,2.1177344),
//            new CarTrackingInfo(48.7948532,2.0553037));
	
	private final Path filePath = Paths.get("/Users/cdubois/confluent-dev/kafka-producer/drivers/driver-2.csv");
	private List<String[]> list = null;
//	
//	
//	
//	public CarTrackingController() {
//		super();
//		try {
//			list = readLineByLine(filePath);
//		} catch (Exception e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
//	}

	//	@MessageMapping("/track")
//	@SendTo("/topic/info")
	/*@Scheduled(fixedRate = 1000)
	private void pushCarInfo() throws Exception {
		
		int i = 0;
		for(String[] line:list) {
			//this.template.convertAndSend("/topic/info", new CarTrackingInfo(Double.valueOf(faker.address().latitude()), Double.valueOf(faker.address().longitude())));
			this.template.convertAndSend("/topic/info", new CarTrackingInfo(Double.valueOf(line[0]), Double.valueOf(line[1])));
			i++;
		}
		
	}
	
	public static List<String[]> readLineByLine(Path filePath) throws Exception {
	    List<String[]> list = new ArrayList<>();
	    try (Reader reader = Files.newBufferedReader(filePath)) {
	        try (CSVReader csvReader = new CSVReader(reader)) {
	            String[] line;
	            while ((line = csvReader.readNext()) != null) {
	                list.add(line);
	            }
	        }
	    }
	    return list;
	}*/

	@MessageMapping("/track")
	private void trackCar(CarTrackingInfo carTrackingInfo) throws Exception {
		System.out.println(carTrackingInfo);
	}

	@MessageMapping("/delivering")
	private void delivering(CarDeliveringEvent carDeliveringEvent) throws Exception {
		System.out.println(carDeliveringEvent);
	}
	
	@MessageMapping("/delivery_status")
	private void deliveryStatus(CarDeliveryStatusEvent carDeliveryStatusEvent) throws Exception {
		System.out.println(carDeliveryStatusEvent);
	}
}
