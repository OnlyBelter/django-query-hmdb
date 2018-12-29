from django.db import connection

# needed columns name of query result
RESULT_COLS = ['accession', 'chemical_formula',
               'monisotopic_molecular_weight',
               'smiles', 'super_class']
RESULT_COLS_STR = ', '.join(['a.'+'`'+i+'`' for i in RESULT_COLS])
DB_NAME = 'hmdb_parsed_xml_20180609'


def convert_query_r2html_r(query_result):
    """
    get a list with dic elements for html render, from query results to html results
    :param query_result: values list from query result
    :return: ([{}, {}, ...])
    """
    results = []
    count = 1
    if query_result:
        for val in query_result:  # each val is a single query result
            # val has same order as RESULT_COLS
            col_name2val = dict(zip(RESULT_COLS, val))
            col_name2val['id'] = count
            count += 1
            for col in RESULT_COLS:
                if col == 'monisotopic_molecular_weight':
                    col_name2val[col] = "%.4f" % float(col_name2val[col])
                else:
                    col_name2val[col] = str(col_name2val[col])
            results.append(col_name2val)
        # haha
    return results


def search_query_mapping(search_values, json_results, sf):
    """
    :param search_values: search values from web input, a list
    :param json_results: json format results from db query, [{}, {}, ..., {}]
    :param sf: search_field contains HMDB_ID, SMILES
    :return: the relation between search values and query results, eg:
             [{'value': 'HMBD0001', 'id': 1}, {'value': 'HMBD0002', 'id': 3}, ...]
    """
    if sf == 'HMDB_ID':
        index = 'accession'
    else:
        index = sf.lower()
    mapping_result = [{'value': i[index], 'id': i['id']} for i in json_results]
    all_acc_in_result = [i[index] for i in json_results]
    for each_value in search_values:
        if each_value not in all_acc_in_result:  # this query didn't get result
            mapping_result.append({'value': each_value, 'id': 999})
    return mapping_result


def query_by_hmdb_id(search_value, search_field):
    """
    :param search_value: search items from user's input, a list
    :param search_field: contains HMDB_ID, SMILES or InChI
    :return: results from database (query_results)
(('HMDB0000022', 'C9H13NO2', '167.094628665', 'COC1=C(O)C=CC(CCN)=C1', 'Benzenoids'),
 ('HMDB0000026', 'C4H8N2O3', '132.053492132', 'NC(=O)NCCC(O)=O', 'Organic acids and derivatives'))
    """
    valid_hmdb_id = True
    # search_value2query_id = {}
    for x in search_value:
        x = x.strip()
        if x:
            if not (x.startswith('HMDB') and len(x) == 11 and x.isalnum()):
                valid_hmdb_id = False
    if valid_hmdb_id:
        # https://docs.djangoproject.com/en/2.1/topics/db/sql/#executing-custom-sql-directly
        with connection.cursor() as cursor:
            query = (
                f'SELECT DISTINCT {RESULT_COLS_STR} FROM {DB_NAME} a '
                f'WHERE a.`{RESULT_COLS[0]}` IN %s;'
            )
            # https://stackoverflow.com/a/53968154/2803344
            # https://docs.djangoproject.com/en/2.1/topics/db/sql/#passing-parameters-into-raw
            cursor.execute(query, params=[search_value])
            query_results = cursor.fetchall()
            # import pdb; pdb.set_trace()
            # haha
        json_results = convert_query_r2html_r(query_results)
        search_value2query_id = search_query_mapping(search_value, json_results, search_field)
        return json_results, search_value2query_id
    else:
        return 'invalid_input', 'Null'


def query_by_smiles(search_value, search_field):
    """
    :search_value: search items from user's input, a list
    :return: results demo
(('HMDB0000022', 'C9H13NO2', '167.094628665', 'COC1=C(O)C=CC(CCN)=C1', 'Benzenoids'),
 ('HMDB0000026', 'C4H8N2O3', '132.053492132', 'NC(=O)NCCC(O)=O', 'Organic acids and derivatives'))
    """
    # https://docs.djangoproject.com/en/2.1/topics/db/sql/#executing-custom-sql-directly
    with connection.cursor() as cursor:
        query = (
            f'SELECT DISTINCT {RESULT_COLS_STR} FROM {DB_NAME} a '
            f'WHERE a.`{RESULT_COLS[3]}` IN %s;'
        )
        # https://stackoverflow.com/a/53968154/2803344
        # https://docs.djangoproject.com/en/2.1/topics/db/sql/#passing-parameters-into-raw
        cursor.execute(query, params=[search_value])
        query_results = cursor.fetchall()
    # import pdb; pdb.set_trace()  # debug in django
    json_results = convert_query_r2html_r(query_results)
    search_value2query_id = search_query_mapping(search_value, json_results, search_field)
    return json_results, search_value2query_id
