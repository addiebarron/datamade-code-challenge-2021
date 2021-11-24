import pytest  # noqa: F401


def test_api_parse_succeeds(client):
    '''
    Test that the API parses a valid address string successfully and
    sends a response with data in the correct structure.
    '''

    address_string = '123 main st chicago il'

    response = client.get('/api/parse/', {'address': address_string})

    assert response.status_code == 200
    assert response.data == {
        'status': 200,
        'input_string': address_string,
        'address_components': {
            'AddressNumber':        '123',
            'StreetName':           'main',
            'StreetNamePostType':   'st',
            'PlaceName':            'chicago',
            'StateName':            'il',
        },
        'address_type': 'Street Address'
    }


def test_api_parse_raises_error(client):
    '''
    Test that the API sends a correct response when parsing an address
    with repeated labels, and that the correct error info is included.
    '''

    address_string = '123 main st chicago il 123 main st'

    response = client.get('/api/parse/', {'address': address_string})

    data, error = response.data, response.data['error']

    assert response.status_code == 200 and data['status'] == 200
    # Is there a better way to test timestamp format? Is it necessary?
    assert type(error['timestamp']) == str
    assert error['input_string'] == address_string
    assert error['title'] == 'Invalid input string'
    assert error['detail'] \
        == 'The address could not be parsed because of a repeated label.'
    assert error['path'] == '/api/parse'
