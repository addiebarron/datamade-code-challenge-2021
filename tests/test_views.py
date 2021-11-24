# import pytest


def test_api_parse_succeeds(client):
    '''
    Test that the API parses a valid address string successfully and
    sends a response with data in the correct structure.
    '''

    address_string = '123 main st chicago il'

    # TODO: Make this work!! #
    response = client.get('api/parse/', {'address': address_string})

    print(response)

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
    Test that the API sends an error response when parsing an address
    with repeated labels, and that the correct data is included.
    '''

    address_string = '123 main st chicago il 123 main st'

    response = client.get('api/parse/', {'address': address_string})

    print(client)

    assert response.data['status'] == 500
    assert type(response.data['error']['timestamp']) == 'str'
    assert response.data['error']['title'] == 'Invalid input string'
    assert response.data['error']['detail'] \
        == 'The address could not be parsed because of a repeated label.'
    assert response.data['error']['path'] == '/api/parse'
