try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError as exc:
    raise ImportError("PyMySQL is required for MySQL database support.") from exc
