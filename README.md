# Playwright SOAP API Testing Framework

A Node.js project built with Playwright for testing SOAP APIs. This framework allows you to send SOAP requests with dynamic data substitution, custom headers, and bearer token authentication, then validate responses using Playwright's assertion capabilities.

## Features

- 📝 Template-based SOAP request generation using Handlebars
- 🔄 Data substitution for dynamic request content
- 🔐 Built-in bearer token authentication
- 📋 Custom header support
- ✅ Playwright Test integration for assertions
- 🔍 Simple XML response parsing and validation

## Project Structure

```
playwright-soap-api/
├── api/
│   ├── requests/      # SOAP request templates (.xml)
│   └── responses/     # Example responses for assertions (.xml)
├── tests/             # Playwright test files
├── utils/             # Utility functions
├── .env               # Environment configuration (not in repo)
├── .env.example       # Example environment configuration
├── playwright.config.ts  # Playwright configuration
└── package.json       # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and configure your environment:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your SOAP endpoint and bearer token:
   ```
   SOAP_ENDPOINT=https://your-soap-api.com/soap
   AUTH_TOKEN=your_bearer_token_here
   ```

## Usage

### Running Tests

Run all tests:

```bash
npm test
```

Run a specific test file:

```bash
npx playwright test tests/soap.spec.ts
```

### Creating New SOAP Tests

1. Add your SOAP request template in `api/requests/` directory (XML with Handlebars syntax)
2. Add any expected responses in `api/responses/` for assertions
3. Create a test file in the `tests/` directory

### Example Test

```typescript
test("should get weather for New York", async ({ request }) => {
  // Prepare data for the template
  const requestData = {
    cityCode: "NYC",
    country: "US",
    date: new Date().toISOString().split("T")[0],
    sessionId: "test-session-123",
  };

  // Process the SOAP request template
  const soapPayload = processSoapTemplate("getWeatherRequest", requestData);

  // Send the SOAP request
  const response = await sendSoapRequest(
    request,
    SOAP_ENDPOINT,
    soapPayload,
    AUTH_TOKEN
  );

  // Assert the response status
  expect(response.status()).toBe(200);

  // Get the response body
  const responseBody = await response.text();

  // Extract values and make assertions
  const cityCode = extractXmlValue(responseBody, "cityCode");
  expect(cityCode).toBe("NYC");
});
```

## Utility Functions

The framework provides several utility functions in `utils/soapUtils.ts`:

- `loadSoapTemplate`: Loads an XML template from the requests directory
- `processSoapTemplate`: Processes a template with provided data
- `sendSoapRequest`: Sends a SOAP request with the appropriate headers
- `extractXmlValue`: Extracts values from XML responses

## Customizing

### Adding Custom Headers

Modify the `sendSoapRequest` function in `utils/soapUtils.ts` to include additional headers:

```typescript
export async function sendSoapRequest(
  request: APIRequestContext,
  endpoint: string,
  payload: string,
  bearerToken?: string,
  additionalHeaders?: Record<string, string>
) {
  const headers: Record<string, string> = {
    SOAPAction: "",
    "Content-Type": "text/xml;charset=UTF-8",
    ...additionalHeaders,
  };
  // ...rest of the function
}
```

### Improving XML Parsing

For more robust XML parsing, consider adding a dedicated XML parser like `xml2js` or `fast-xml-parser`.

## Troubleshooting

### 403 Forbidden Errors

If you're encountering 403 (Forbidden) errors when making SOAP requests, check the following:

1. **Bearer Token Issues**:

   - Verify your token is valid and not expired
   - Check the token format (some APIs require "Bearer " prefix, others don't)
   - Generate a new token if needed

2. **Missing Headers**:

   - Some SOAP services require specific headers for authentication
   - Common required headers include:
     - SOAPAction (with the correct action URI)
     - Custom API keys in headers
     - Host header

3. **Authentication Method**:

   - Ensure you're using the correct authentication method (token, Basic Auth, etc.)
   - Some services require credentials in the SOAP envelope instead of headers

4. **IP Whitelisting**:

   - Check if the service requires your IP to be whitelisted
   - Contact the API provider to ensure your IP is authorized

5. **Request Inspection**:
   - Enable request logging to inspect the exact request being sent:

```typescript
// Add this to your test
console.log("Request payload:", soapPayload);
console.log("Request headers:", headers);
```

### Example with Complete Headers

Update your `sendSoapRequest` function to include all potentially required headers:

```typescript
export async function sendSoapRequest(
  request: APIRequestContext,
  endpoint: string,
  payload: string,
  bearerToken?: string,
  action?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "text/xml;charset=UTF-8",
    Accept: "text/xml",
    SOAPAction: action || "",
    "User-Agent": "Playwright SOAP Client/1.0",
  };

  if (bearerToken) {
    // Try with and without the 'Bearer ' prefix if you're having issues
    headers["Authorization"] = `Bearer ${bearerToken}`;
    // Some APIs might require just the token:
    // headers['Authorization'] = bearerToken;
  }

  console.log("Sending request to:", endpoint);
  console.log("Headers:", JSON.stringify(headers, null, 2));

  return await request.post(endpoint, {
    headers,
    data: payload,
  });
}
```

## Common Issues

### .gitignore Not Working

If your `.gitignore` file isn't working correctly, try these solutions:

1. **Files Already Tracked**: Files that were already tracked by Git before being added to `.gitignore` will continue to be tracked. Remove them from Git's tracking with:

   ```bash
   git rm --cached <file-name>
   # For directories:
   git rm --cached -r <directory-name>
   ```

2. **Clear Git Cache**: Sometimes clearing Git's cache helps apply new ignore rules:

   ```bash
   git rm -r --cached .
   git add .
   git commit -m "Apply .gitignore rules"
   ```

3. **Proper Formatting**: Make sure your `.gitignore` file doesn't have any:

   - Hidden characters or BOM markers
   - DOS/Windows line endings (should be LF)
   - Comments in the wrong format (should start with `#`)

4. **Global .gitignore Conflict**: Check if there's a global .gitignore interfering:

   ```bash
   git config --get core.excludesfile
   ```

5. **Nested Git Repositories**: Ensure there are no nested `.git` directories that could affect rule application.

## License

ISC
