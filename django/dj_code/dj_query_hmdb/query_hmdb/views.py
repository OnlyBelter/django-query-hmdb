from django.http import HttpResponse
from django.shortcuts import render
from query_hmdb.self_code.forms import SearchForm
from query_hmdb.self_code.query_db import (query_by_hmdb_id, query_by_smiles)


# Create your views here.
def hmdb_home(request):
    return render(request, 'index.html')


def hmdb_search(request):
    search_form = SearchForm()
    return render(request, 'hmdb_search.html', {'search_form': search_form})


def hmdb_result_search(request):
    # This view for CCS Search
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = SearchForm(request.POST)
        # check whether it's valid:
        if form.is_valid():
            cd = form.cleaned_data
            # print(cd)
            search_field = str(cd.get('search_field'))  # convert a unicode string to a string in python
            search_value = str(cd.get('search_value')).split('\r\n')  # a list
            if len(search_value) > 100:  # limiting maximum 20 query items per request
                search_value = search_value[:100]
            # do db search here
            result_from_query = ([], [])
            if search_field == 'HMDB_ID':
                # check length and the first four alphabets of all search value
                result_from_query = query_by_hmdb_id(search_value, search_field)
            elif search_field == 'SMILES':
                result_from_query = query_by_smiles(search_value, search_field)
            results_s = result_from_query[0]
            print(results_s)
            search_value2query_id = result_from_query[1]
            if results_s == 'invalid_input':
                return HttpResponse('Input is invalid! The length of HMDB ID should be 11 and start with "HMDB",'
                                    ' please input correct %s!' % search_field)
            # search_value = [{'value': x} for x in search_value]
            search_field_dir = {'field': search_field}

            # haha
            return render(request, 'hmdb_result_search.html',
                          {'search2query': search_value2query_id,
                           'results': results_s, 'search_field': search_field_dir})
        else:
            return HttpResponse('Input is invalid!')

    # if a GET (or any other method) we'll create a blank form
    else:
        return HttpResponse('The method is not post!')


def CCS_input_example(request):
    return render(request, 'input_example.csv', content_type='text/plain')
