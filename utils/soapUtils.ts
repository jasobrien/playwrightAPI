import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { APIRequestContext } from '@playwright/test';

/**
 * Loads a SOAP template from the samples directory and compiles it with Handlebars
 */
export function loadSoapTemplate(templateName: string): Handlebars.TemplateDelegate {
  const templatePath = path.join(__dirname, '../api/requests', `${templateName}.xml`);
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  return Handlebars.compile(templateContent);
}

/**
 * Processes a SOAP template with the provided data
 */
export function processSoapTemplate(templateName: string, data: Record<string, any>): string {
  const template = loadSoapTemplate(templateName);
  return template(data);
}

/**
 * Sends a SOAP request with the given payload and authorization
 */
export async function sendSoapRequest(
  request: APIRequestContext,
  endpoint: string,
  payload: string,
  bearerToken?: string,
  action?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'text/xml;charset=UTF-8',
    'Accept': 'text/xml',
    'SOAPAction': action || '',
    'User-Agent': 'Playwright SOAP Client/1.0'
  };

  if (bearerToken) {
    // Some APIs require the 'Bearer ' prefix, others don't
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }

  console.log(`Sending SOAP request to: ${endpoint}`);
  
  try {
    const response = await request.post(endpoint, {
      headers,
      data: payload
    });
    
    if (response.status() === 403) {
      console.error('403 Forbidden Error Details:');
      console.error('- Check if your bearer token is valid and not expired');
      console.error('- Verify if additional headers are required');
      console.error('- Ensure your IP address is allowed to access the service');
      
      // Log response headers which might contain error details
      console.error('Response headers:', await response.headersArray());
    }
    
    return response;
  } catch (error) {
    console.error('Error sending SOAP request:', error);
    throw error;
  }
}

/**
 * Extracts XML values using a simple approach (for demonstration)
 * In a real project, consider using a proper XML parser
 */
export function extractXmlValue(xmlResponse: string, xpath: string): string | null {
  const regex = new RegExp(`<${xpath}>([^<]+)</${xpath}>`);
  const match = xmlResponse.match(regex);
  return match ? match[1] : null;
}
