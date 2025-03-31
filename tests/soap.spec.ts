import { test, expect } from '@playwright/test';
import { processSoapTemplate, sendSoapRequest, extractXmlValue } from '../utils/soapUtils';
import fs from 'fs';
import path from 'path';

// Get configuration from environment variables
const SOAP_ENDPOINT = process.env.SOAP_ENDPOINT || 'https://example.com/soap';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

// Add this function to help debug 403 errors
async function logResponseDetails(response) {
  console.log(`Response status: ${response.status()}`);
  console.log(`Response status text: ${response.statusText()}`);
  
  const responseBody = await response.text();
  console.log('Response body:', responseBody.substring(0, 500) + (responseBody.length > 500 ? '...' : ''));
  
  const headers = await response.headersArray();
  console.log('Response headers:', headers);
}

test.describe('SOAP API Tests', () => {
  
  test('should get weather for New York', async ({ request }) => {
    // Prepare data for the template
    const requestData = {
      cityCode: 'NYC',
      country: 'US',
      date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
      sessionId: 'test-session-123'
    };

    // Process the SOAP request template
    const soapPayload = processSoapTemplate('getWeatherRequest', requestData);
    
    // For debugging, log the actual payload being sent
    console.log('SOAP Request Payload:', soapPayload);
    
    // Send the SOAP request with an action URI (might be required by some services)
    // The action URI typically matches the operation being called
    const response = await sendSoapRequest(
      request,
      SOAP_ENDPOINT,
      soapPayload,
      AUTH_TOKEN,
      'http://example.com/weather/GetWeather' // Try adding a SOAPAction header
    );

    // Log details for debugging if it's a 403
    if (response.status() === 403) {
      await logResponseDetails(response);
      
      // Don't fail the test immediately to allow examination of the logs
      console.log('Received 403 Forbidden. See logs above for details.');
    }
    
    // Assert the response status
    expect(response.status()).toBe(200);
    
    // Get the response body
    const responseBody = await response.text();
    
    // Extract values from the XML response and make assertions
    const cityCode = extractXmlValue(responseBody, 'cityCode');
    const temperature = extractXmlValue(responseBody, 'temperature');
    const success = extractXmlValue(responseBody, 'success');
    
    expect(cityCode).toBe('NYC');
    expect(temperature).not.toBeNull();
    expect(success).toBe('true');
    
    // For demonstration, you could also compare with expected response
    // In real tests, you'd make more specific assertions
    const expectedResponsePath = path.join(__dirname, '../api/responses/getWeatherResponse.xml');
    const expectedResponse = fs.readFileSync(expectedResponsePath, 'utf-8');
    
    // Here you might want to normalize XML and make a more structured comparison
    // For simplicity, we'll just check if certain patterns are present
    expect(responseBody).toContain('<GetWeatherResponse');
    expect(responseBody).toContain('<temperature>');
  });

  test('should handle error response for invalid city', async ({ request }) => {
    const requestData = {
      cityCode: 'INVALID',
      country: 'US',
      date: new Date().toISOString().split('T')[0]
    };

    const soapPayload = processSoapTemplate('getWeatherRequest', requestData);
    
    const response = await sendSoapRequest(
      request, 
      SOAP_ENDPOINT, 
      soapPayload,
      AUTH_TOKEN
    );
    
    // Depending on the API, you might get different error responses
    // This is just an example
    expect(response.status()).toBe(400);
    
    const responseBody = await response.text();
    expect(responseBody).toContain('error');
  });
});
