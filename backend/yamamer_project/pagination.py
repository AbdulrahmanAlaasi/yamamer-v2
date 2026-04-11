from rest_framework.pagination import PageNumberPagination


class FlexiblePageNumberPagination(PageNumberPagination):
    """
    Allows clients to request large pages via ?page_size=N (max 500).
    Default page size stays 20 for backward compatibility.
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 500
