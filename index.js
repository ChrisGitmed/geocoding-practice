require('dotenv').config();
const axios = require('axios');


/**
 * Google Geocoding API
 *
 * Very simple to use, but addresses are not preformatted with census track.
 * Also, not every address has a census track (Is this normal?).
 */
const getLocationWithGoogle = async (location) => {
  console.log('\nMatching locations with Google Geocoding API....\n')
  const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GOOGLE_API_KEY}`);
  console.log('location: ', location, '\n')
  console.log('res.data: ', res.data, '\n');
  // console.log('res.data.results: ', res.data.results, '\n');
  const formattedAddress = res.data.results.map( (adr, idx) => {
    // console.log('adr.address_components: ', adr.address_components, '\n');

    const components = res.data.results[idx].address_components
    if (components[components.length -1].types[0] === 'postal_code_suffix') {
      const postalSuffix = components[components.length - 1].long_name;
      const splitAddress = adr.formatted_address.split(',');
      const revisedZip = `${splitAddress[splitAddress.length - 2]}-${postalSuffix}`;
      splitAddress[splitAddress.length - 2] = revisedZip;
      return splitAddress.join(',');
    }
    else return adr.formatted_address;
  })
  console.log('formattedAddress: ', formattedAddress, '\n')
}


/**
 * UPS
 *
 * When I request my API key...
 * "We're experiencing some technical issues. Status is currently unavailable."
 */
// const getLocationWithUPS = async (location) => {
//   const results = await axios.get();
// }


/**
 * USPS
 *
 * https://www.usps.com/business/web-tools-apis/address-information-api.htm#_Toc39492051
 *
 * "The Address Validation APIs can be used in conjunction with USPS SHIPPING OR MAILING SERVICES ONLY.
 *  The Address API must only be used on an individual transactional basis, i.e. not batch processing
 *  or cleansing of a database, but as a customer enters the information into a form on a website.
 *  Failure to comply with these terms and conditions can result in termination of USPS API access
 *  without prior notice."
 */
// const getLocationWithUSPS = async(location) => {
//   const results = await axios.get();
// }


/**
 * SmartyStreets
 *
 * Easy to use, but the data needs to be more complete vs. Google Geocoding API.
 *
 * Only seems to return one match.
 *
 * Does allow for bulk validation (processing lists of addresses at a time), but
 * not sure if we would use this.
 *
 * Automatically includes the census track.
 */

const getLocationWithSmartyStreets = async(location) => {
  console.log('\nMatching locations with SmartyStreets....\n')
  console.log('location: ', location, '\n')
  const { street, city, state } = location;
  try {
    const results = await axios.get(`https://us-street.api.smartystreets.com/street-address?auth-id=${process.env.SMARTY_AUTH_ID}&auth-token=${process.env.SMARTY_AUTH_TOKEN}&street=${street}&city=${city}&state=${state}&candidates=10`);
    console.log('results.data: ', results.data)

    const formattedAddresses = results.data.map( (adr, idx) => {
      return `${adr.delivery_line_1}, ${adr.last_line}, USA`
    })
    console.log('formattedAddresses: ', formattedAddresses, '\n');
  }
  catch (e) {
    console.error(e.response)
  }
}

const run = async () => {
  // await getLocationWithGoogle('1425 almund ave');
  await getLocationWithSmartyStreets({ street: '1425 Almond', city: 'Santa barbar', state: 'CA' });
}

run();
