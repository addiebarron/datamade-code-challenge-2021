import usaddress
from django.views.generic import TemplateView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from datetime import datetime


class Home(TemplateView):
    template_name = 'parserator_web/index.html'


class AddressParse(APIView):
    renderer_classes = [JSONRenderer]

    def get(self, request):
        '''
        Handle GET requests to this endpoint.
        '''

        input_string = request.query_params.get('address')

        # Parse the address
        try:
            tagged_address, address_type = self.parse(input_string)
        # Handle RepeatedLabelError
        except usaddress.RepeatedLabelError as e:
            timestamp = str(datetime.now())
            status = 500
            response_data = {
                'status': status,
                'error': {
                    'timestamp': timestamp,
                    'input_string': input_string,
                    'title': 'Invalid input string',
                    'detail': 'The address could not be parsed because of a repeated label.',
                    'path': '/api/parse'
                }
            }
        # Handle all other errors
        except:
            timestamp = str(datetime.now())
            status = 500
            response_data = {
                'status': status,
                'error': {
                    'timestamp': timestamp,
                    'input_string': input_string,
                    'title': 'Internal server error',
                    'detail': 'The server encountered an error parsing that address.',
                    'path': '/api/parse',
                }
            }
        # If there are no errors
        else:
            status = 200
            response_data = {
                'status': status,
                'input_string': input_string,
                'address_components': tagged_address,
                'address_type': address_type,
            }

        return Response(data=response_data, status=status)

    def parse(self, address):
        '''
        Use the usaddress module to parse a given address.
        Returns a tuple containing the type (string) and components (OrderedDict) of the address.
        '''

        address_components, address_type = usaddress.tag(address)

        return address_components, address_type
