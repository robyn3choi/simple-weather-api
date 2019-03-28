HOW I DID THE HOSTING FOR SIMPLE-WEATHER

Front end:
- used netlify for the client (howsthesky.com) and they did everything including https automatically

Back end:
- create elastic beanstalk environment
- upload zip folder of the simple-weather-api
- in elastic beanstalk > configuration > software, set the env variables
- in route53, created a hosted zone for api.howsthesky.com
- create record set - type: A-IPv4 address, alias: yes, alias target: [elastic beanstalk env url]
- in netlify, create dns records to api.howsthesky.com for each of the nameservers in the ns record in the hosted zone i just created in route53.
- for https
	- in elastic beanstalk > configuration > capacity, change it from single instance to load balanced and change the max instances to 1
	- use amazon certificate manager to get the certificate 