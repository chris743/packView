import dash
from dash import html, dcc
from dash.dependencies import Input, Output
import pandas as pd
import plotly.express as px
from sqlalchemy import create_engine
import dash_bootstrap_components as dbc
from datetime import date, timedelta
import plotly.graph_objects as go
import re


# Database connection setup
DATABASE_TYPE = 'postgresql'
DBAPI = 'psycopg2'
USER = 'chrism'
PASSWORD = '!Cncamrts1'
HOST = '192.168.128.30'
PORT = '5432'
DATABASE = 'Production_data'
SCHEMA = 'production'
TABLE_NAME = 'orders'

# Constants
DARK_BG_COLOR = "rgba(0,0,0,0)"
TEXT_COLOR = "white"

engine = create_engine(f"{DATABASE_TYPE}+{DBAPI}://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}")

# Helper functions
def dark_mode_fig(fig):
    """Apply dark mode styling to plotly figures"""
    fig.update_layout(
        paper_bgcolor=DARK_BG_COLOR,
        plot_bgcolor=DARK_BG_COLOR,
        font=dict(color=TEXT_COLOR),
        xaxis=dict(gridcolor='#444'),
        yaxis=dict(gridcolor='#444')
    )
    return fig

def split_count_size(df, style_col, order_quantity_col):
    """
    Splits a style_id column into count and size based on specific patterns and calculates total bags.

    Parameters:
        df (pd.DataFrame): The input DataFrame containing the style_id and order_quantity columns.
        style_col (str): The name of the column containing style_id.
        order_quantity_col (str): The name of the column containing order_quantity.

    Returns:
        pd.DataFrame: The DataFrame with three new columns: 'count', 'size', and 'total_bags'.
    """
    def extract_count_size(style):
        """
        Extracts count and size from a style string.
        """
        if not isinstance(style, str):  # Handle None or non-string values
            return None, None
        # Match patterns like '10-4#', '150/4', '10-4', or '150/4 G'
        match = re.search(r'(\d+)[/-](\d+)', style)
        if match:
            return int(match.group(1)), int(match.group(2))
        return None, None

    # Apply extraction to the style_id column
    counts_and_sizes = df[style_col].apply(lambda x: pd.Series(extract_count_size(x)))
    counts_and_sizes.columns = ['count', 'size']

    # Avoid SettingWithCopyWarning by using .assign() to create a new DataFrame with total_bags
    counts_and_sizes = counts_and_sizes.assign(
        total_bags=counts_and_sizes['count'] * df[order_quantity_col]
    )
    
    # Adjust total_bags if the style contains 'TWB'
    counts_and_sizes['total_bags'] = counts_and_sizes.apply(
        lambda row: row['total_bags'] / 18 if 'TWB' in str(df.loc[row.name, style_col]) else row['total_bags'],
        axis=1
    )

    # Add the new columns to the original DataFrame
    df = pd.concat([df.reset_index(drop=True), counts_and_sizes.reset_index(drop=True)], axis=1)

    return df

def calculate_total_volume(df):
    """Calculates the total volume in the DataFrame."""
    df_filtered = df[df['shipped_status'] != 'SHIPPED']  # Exclude rows where shipped_status is 'shipped'
    total_order_quantity = df_filtered['order_quantity'].sum()
    return total_order_quantity

def filter_by_date(df, start_date, end_date):
    """Returns rows where 'ship_date' is between start_date and end_date."""
    return df[(df['ship_date'] >= pd.Timestamp(start_date)) & 
             (df['ship_date'] <= pd.Timestamp(end_date))]

def percent_total_volume_today(df, full_df):
    """Calculates % total volume for today."""
    today = pd.Timestamp(date.today())
    today_df = filter_by_date(df, today, today)
    today_volume = calculate_total_volume(today_df)
    overall_volume = calculate_total_volume(full_df)
    return f"{(today_volume / overall_volume * 100):.1f}%" if overall_volume > 0 else "0%"

def percent_total_volume_this_week(df, full_df):
    """Calculates % total volume for the current week."""
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday() + 1)
    this_week_df = filter_by_date(df, start_of_week, today)
    this_week_volume = calculate_total_volume(this_week_df)
    overall_volume = calculate_total_volume(full_df)
    return f"{(this_week_volume / overall_volume * 100):.1f}%" if overall_volume > 0 else "0%"

def percent_total_volume_last_week(df, full_df):
    """Calculates % total volume for the previous week."""
    today = date.today()
    start_of_last_week = today - timedelta(days=today.weekday() + 8)
    end_of_last_week = today - timedelta(days=today.weekday() + 2)
    last_week_df = filter_by_date(df, start_of_last_week, end_of_last_week)
    last_week_volume = calculate_total_volume(last_week_df)
    overall_volume = calculate_total_volume(full_df)
    return f"{(last_week_volume / overall_volume * 100):.1f}%" if overall_volume > 0 else "0%"

def create_size_chart(df, today):
    df = df[df['ship_date'].dt.date == today]
    df['size'] = df['size'].astype(str) + 'lb'
    df = df.groupby('size').agg(total_quantity=('total_bags', 'sum')).reset_index()

    fig = px.bar(df, 
                 x='total_quantity', 
                 y='size', 
                 orientation='h', 
                 text='total_quantity'
                )
    fig.update_layout(margin=dict(l=0, r=0, t=25, b=0),
    height=200)
    return fig

def create_bulk_chart(df, today):
    df = df[df['ship_date'].dt.date == today]
    df = df.groupby('style_id').agg(total_quantity=('order_quantity', 'sum')).reset_index()

    fig = px.bar(df, 
                 x='total_quantity', 
                 y='style_id', 
                 orientation='h', 
                 text='total_quantity'
                )
    fig.update_layout(margin=dict(l=0, r=0, t=25, b=0),
                      height=200)
    return fig

def create_donut(value, full_value, offset):
    print(offset)
    """Creates a donut chart with color-coded capacity indicators"""
    percentage = ((value/full_value) * 100) - offset
    print(percentage)
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=percentage,
        number={'suffix': "%"},
        gauge={
            'axis': {'range': [None, 100]},
            'steps': [
                {'range': [0, 70], 'color': "rgba(0,128,0,0.3)"},
                {'range': [70, 90], 'color': "rgba(255,255,0,0.5)"},
                {'range': [90, 100], 'color': "rgba(255,0,0,0.8)"},
            ],
            'bar': {'color': 'gray'},
        },
        domain={'x': [0, 1], 'y': [.3, 1]}
    ))
    fig.update_layout(margin=dict(l=40, r=40, t=0, b=0), height=230)
    return fig

def get_top_sellers(df):
    """Get top 5 sellers from DataFrame for the current week (starting from Sunday)."""

    # Convert the order_date column to datetime if it's not already
    # Ensure the ship_date column is parsed as datetime
    df['ship_date'] = pd.to_datetime(df['ship_date'], errors='coerce')

    # Get the current date
    today = pd.Timestamp.today()

    # Calculate the most recent Sunday
    last_sunday = today - pd.Timedelta(days=today.weekday() + 1)

    # Filter the DataFrame to include only the current week's data
    df_week = df[(df['ship_date'] >= last_sunday) & (df['ship_date'] <= today)]

    # Group by commodity, style, and customer, then aggregate by total volume
    top_sellers = (
        df_week.groupby(['commodity_id', 'style_id', 'customer'])
        .agg(total_volume=('order_quantity', 'sum'))
        .reset_index()
        .sort_values(by='total_volume', ascending=False)
        .head(5)
    )
    
    return top_sellers
def format_top_sellers(df):
    """Format top sellers into HTML paragraphs"""
    cell_style = {
        'white-space': 'nowrap',
        'overflow': 'hidden',
        'text-overflow': 'ellipsis',
        'max-width': '150px',  # Adjust the width as needed
    }

    rows = []

    for _, row in df.iterrows():
        rows.append(
            html.Tr([
                html.Td(row['commodity_id'], style=cell_style),
                html.Td(row['style_id'], style=cell_style),
                html.Td(row['customer'], style=cell_style),
                html.Td(row['total_volume'], style=cell_style),
            ])
        )

    table = html.Table(
        [
            html.Tr([
                html.Th("Commodity"),
                html.Th("Style"),
                html.Th("Customer"),
                html.Th("Equiv. Qty."),
            ])
        ] + rows,  # Unpack rows directly here
        style={'width': '100%'}
    )
    return table

dash.register_page(__name__, path='/capacity')

# Layout definition
layout = html.Div([
    html.Div([
        dbc.Row([
            dbc.Col([
                html.H3(["Giro Capacity"], style={'textAlign': 'center'}),
                dcc.Graph(id='giro-capacity-donut'),
            ],style={'max-width':'25%', 'height':'200px'},),
            dbc.Col([
                html.H3(["Fox Capacity"], style={'textAlign': 'center'}),
                dcc.Graph(id='fox-capacity-donut'),
            ],style={'max-width':'25%', 'height':'200px'}),
            dbc.Col([
                html.H3(["Vexar Capacity"], style={'textAlign': 'center'}),
                dcc.Graph(id='vexar-capacity-donut'),
            ],style={'max-width':'25%', 'height':'200px'}),
            dbc.Col([
                html.H3(["Bulk Capacity"], style={'textAlign': 'center'}),
                dcc.Graph(id='bulk-capacity-donut'),
            ],style={'max-width':'25%', 'height':'200px'}),
        ], className='mb-3'),
        
        # Top sellers cards row
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Top Giro Sellers This Week"),
                    dbc.CardBody(html.Div(id='giro-top-sellers'), style={'font-size': '11pt'}),
                ])
            ]),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Top Fox Sellers This Week"),
                    dbc.CardBody(html.Div(id='fox-top-sellers'), style={'font-size': '11pt'}),
                ])
            ]),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Top Vexar This Week"),
                    dbc.CardBody(html.Div(id='vexar-top-sellers'), style={'font-size': '11pt'}),
                ])
            ]),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Top Bulk Sellers This Week"),
                    dbc.CardBody(html.Div(id='bulk-top-sellers'), style={'font-size': '11pt'}),
                ])
            ]),
        ], className='mb-4'),
        
        # Stats cards row
        dbc.Row([
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Giro Weekly Stats"),
                    dbc.CardBody(id='giro-stats-table'),
                ])
            ]),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Fox Weekly Stats"),
                    dbc.CardBody(id='fox-stats-table'),
                ])
            ]),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Vexar Weekly Stats"),
                    dbc.CardBody(id='vexar-stats-table'),
                ])
            ]),
            dbc.Col([
                dbc.Card([
                    dbc.CardHeader("Bulk Weekly Stats"),
                    dbc.CardBody(id='bulk-stats-table'),
                ])
            ]),
        ]),

        dbc.Row([
            dbc.Col([
                    dcc.Graph(id='giro-bar-chart'),
            ],style={'max-width':'25%', 'height':'150px'}),
            dbc.Col([
                    dcc.Graph(id='fox-bar-chart'),
            ],style={'max-width':'25%', 'height':'150px'}),
            dbc.Col([
                    dcc.Graph(id='vexar-bar-chart'),
            ],style={'max-width':'25%', 'height':'150px'}),
            dbc.Col([
                    dcc.Graph(id='bulk-bar-chart'),
            ],style={'max-width':'25%', 'height':'150px'}),
        ]),

        dbc.Row([
            dbc.Col([
                    dbc.Input(id='giro-offset', type='number', value=0, min=0, placeholder='Offset', style={'width': '80%', 'margin': '10px auto'}),
                    dcc.Store(id='giro-offset-store')

            ],style={'max-width':'25%', 'margin-top': '50px'}),
            dbc.Col([
                    dbc.Input(id='fox-offset', type='number', value=0, min=0, placeholder='Offset', style={'width': '80%', 'margin': '10px auto'}),
                    dcc.Store(id='fox-offset-store')
            ],style={'max-width':'25%', 'margin-top': '50px'}),
            dbc.Col([
                    dbc.Input(id='vexar-offset', type='number', value=0, min=0, placeholder='Offset', style={'width': '80%', 'margin': '10px auto'}),
                    dcc.Store(id='vexar-offset-store')

            ],style={'max-width':'25%', 'margin-top': '50px'}),
            dbc.Col([
                    dbc.Input(id='bulk-offset', type='number', value=0, min=0, placeholder='Offset', style={'width': '80%', 'margin': '10px auto'}),
                    dcc.Store(id='bulk-offset-store')

            ],style={'max-width':'25%', 'margin-top': '50px'}),
        ]),
    ], style={'margin': '2rem'}),
    dcc.Interval(id='interval-component', interval=10*1000, n_intervals=0),
])

@dash.callback(
    [
        Output('giro-capacity-donut', 'figure'),
        Output('fox-capacity-donut', 'figure'),
        Output('vexar-capacity-donut', 'figure'),
        Output('bulk-capacity-donut', 'figure'),
        Output('giro-top-sellers', 'children'),
        Output('fox-top-sellers', 'children'),
        Output('vexar-top-sellers', 'children'),
        Output('bulk-top-sellers', 'children'),
        Output('giro-stats-table', 'children'),
        Output('fox-stats-table', 'children'),
        Output('vexar-stats-table', 'children'),
        Output('bulk-stats-table', 'children'),
        Output('giro-bar-chart', 'figure'),
        Output('fox-bar-chart', 'figure'),
        Output('vexar-bar-chart', 'figure'),
        Output('bulk-bar-chart', 'figure'),
        

    ],
    [
    Input('interval-component', 'n_intervals'),
    Input('giro-offset-store', 'data'),
    Input('fox-offset-store', 'data'),
    Input('vexar-offset-store', 'data'),
    Input('bulk-offset-store', 'data'),
    ]
)
def update_components(n_intervals, giro_offset, fox_offset, vexar_offset, bulk_offset):
    # Load and preprocess data
    with engine.connect() as connection:
        df = pd.read_sql(f"SELECT * FROM {SCHEMA}.{TABLE_NAME}", connection)
    
    df['ship_date'] = pd.to_datetime(df['ship_date'])
    df['order_quantity'] = df.apply(
        lambda row: row['order_quantity'] * 18 if row['style_id'] and 
        ('tri-wall' in str(row['style_id']).lower() or 'twb' in str(row['style_id']).lower()) 
        else row['order_quantity'],
        axis=1
    )

    # Filter data for each category
    today = date.today()
    df['ship_date'] = df['ship_date'].replace('', None)
    today_df = df[df['ship_date'].dt.date == today]

    start_of_week = today - timedelta(days=today.weekday() + 1)
    this_week_df = filter_by_date(df, start_of_week, today)

    start_of_last_week = today - timedelta(days=today.weekday() + 8)
    end_of_last_week = today - timedelta(days=today.weekday() + 2)
    last_week_df = filter_by_date(df, start_of_last_week, end_of_last_week)
    
    category_filters = {
        'giro': r'giro|G',
        'fox': r'fox|f',
        'vexar': r'vex|V',
        'bulk': r'^(?!.*(GIRO|FOX|VEX|TWB)).*$'
    }
    
    capacity_limits = {
        'giro': 336000,
        'fox': 60000,
        'vexar': 62000,
        'bulk': 17000
    }
    
    filtered_dfs = {}
    current_values = {}
    donut_charts = {}
    top_sellers = {}
    stats_tables = {}
    bar_charts={}

    df = split_count_size(df, 'style_id', 'order_quantity')

    for category, pattern in category_filters.items():

        def compute_capacity(row):
            capacities = []
            if row.get('grade_id') == 'CHOICE':
                capacities.append(0.7)
            if 'rpc' in str(row.get('method_id')).lower():
                capacities.append(0.85)
            if str(row.get('style_id')).upper() in ['5# CARTON', '10# CARTON']:
                capacities.append(0.2)
            else:
                capacities.append(1)
            return min(capacities) * row['order_quantity'] if capacities else None  # Take the lowest value if multiple criteria match

        if category == 'bulk':
            filtered_dfs[category] = df[~df['style_id'].str.contains('|'.join(['GIRO', 'FOX', 'VEX', 'TWB']), 
                                                                    case=False, na=False)]
            
            filtered_dfs[category]['capacity_value'] = df.apply(compute_capacity, axis=1)

             # Calculate current values
            current_values[category] = filtered_dfs[category][
                filtered_dfs[category]['ship_date'].dt.date == today
            ]['capacity_value'].sum()
        else:
            filtered_dfs[category] = df[df['style_id'].str.contains(pattern, case=False, na=False)]
        
            # Calculate current values
            current_values[category] = filtered_dfs[category][
                filtered_dfs[category]['ship_date'].dt.date == today
            ]['total_bags'].sum()

    
        # Create donut charts
        if category == 'giro':
                offset = giro_offset
        if category == 'fox':
            offset = fox_offset
        if category == 'vexar':
            offset = vexar_offset
        if category == 'bulk':
            offset = bulk_offset

        donut_charts[category] = dark_mode_fig(
            create_donut(current_values[category], capacity_limits[category], offset)
        )
        
        if category != 'bulk':
            bar_charts[category] = dark_mode_fig(
                create_size_chart(filtered_dfs[category], today)
            )
        else:
            bar_charts['bulk'] = dark_mode_fig(
                create_bulk_chart(filtered_dfs[category], today)
            )


        # Get top sellers
        top_sellers[category] = format_top_sellers(
            get_top_sellers(filtered_dfs[category])
        )
        
        # Create stats tables
        stats_tables[category] = html.Table([
            html.Tr([
                html.Th("Metric"),
                html.Th("Today"),
                html.Th("This Week"),
                html.Th("Last Week"),
            ]),
            html.Tr([
                html.Td("% Volume"),
                html.Td(percent_total_volume_today(filtered_dfs[category], today_df)),
                html.Td(percent_total_volume_this_week(filtered_dfs[category], this_week_df)),
                html.Td(percent_total_volume_last_week(filtered_dfs[category], last_week_df)),
            ]),
            html.Tr([
                html.Td("Total Volume"),
                html.Td(str(int(calculate_total_volume(filter_by_date(filtered_dfs[category], today, today))))),
                html.Td(str(int(calculate_total_volume(filter_by_date(filtered_dfs[category], today - timedelta(days=today.weekday() + 1), today))))),
                html.Td(str(int(calculate_total_volume(filter_by_date(filtered_dfs[category], today - timedelta(days=today.weekday() + 8), today - timedelta(days=today.weekday() + 2)))))),
            ]),
        ], className="w-full", style={'width': '100%'})

    return (
        donut_charts['giro'],
        donut_charts['fox'],
        donut_charts['vexar'],
        donut_charts['bulk'],
        top_sellers['giro'],
        top_sellers['fox'],
        top_sellers['vexar'],
        top_sellers['bulk'],
        stats_tables['giro'],
        stats_tables['fox'],
        stats_tables['vexar'],
        stats_tables['bulk'],
        bar_charts['giro'],
        bar_charts['fox'],
        bar_charts['vexar'],
        bar_charts['bulk'],
    )

@dash.callback(
    [
        Output('giro-offset-store', 'data'),
        Output('fox-offset-store', 'data'),
        Output('vexar-offset-store', 'data'),
        Output('bulk-offset-store', 'data'),
    ],
    [
        Input('giro-offset', 'value'),
        Input('fox-offset', 'value'),
        Input('vexar-offset', 'value'),
        Input('bulk-offset', 'value'),
    ]
)
def update_stores(giro_offset, fox_offset, vexar_offset, bulk_offset):
    # Update the store with the latest offset values
    return giro_offset or 0, fox_offset or 0, vexar_offset or 0, bulk_offset or 0
