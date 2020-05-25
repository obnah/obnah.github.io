import os, subprocess, optparse

parser = optparse.OptionParser()
parser.add_option("-e", "--exec",  dest="execfile", default="a.out", help="exec file of target program", metavar="FILE")
parser.add_option("-t", "--trace", dest="tracefile", default="trace.txt", help="trace log file", metavar="FILE")

(options, args) = parser.parse_args()

def get_symbol(entry):
	command = '%s/addr2line 0x%x -e %s -f'%(os.getcwd(), entry, options.execfile)
	output  = subprocess.check_output(command, shell=True)
	return output.splitlines()[0]


class CallNode:
	NodeMap = {}
	def __init__(self, entry):
		self.entry  = entry
		self.symbol = get_symbol(entry)
		self.callSequence = []
		self.callStatistic = {}


def step_in_func(stack, addr):
	if addr not in CallNode.NodeMap:
		CallNode.NodeMap[addr] = CallNode(addr)
	current = CallNode.NodeMap[addr]

	if len(stack) > 0:
		parent = CallNode.NodeMap[stack[-1]]
		parent.callSequence.append(current)
		if current not in parent.callStatistic:
			parent.callStatistic[current] = 1
		else:
			parent.callStatistic[current] += 1
	stack.append(addr)


def step_out_func(stack, addr):
	if addr != stack.pop():
		print 'call stack check faild'
		os.exit(1)


f = open(options.tracefile)
try:
	callstack = []
	for line in f:
		act  = line[0]
		addr = int(line[1:], base=16)
		{ 'E': lambda x: step_in_func(callstack, x),
		  'X': lambda x: step_out_func(callstack, x)
		}[act](addr)
finally:
	f.close()


def output_graphviz():
	dot_file_name = '%s.dot'%options.execfile
	dot_file = open(dot_file_name, 'w')
	dot_file.write('digraph %s {\n'%options.execfile)
	for (key, node) in CallNode.NodeMap.items():
		dot_file.write('  %s [shape=rectangle]\n'%node.symbol)
	for (key, node) in CallNode.NodeMap.items():
		for (child, calls) in node.callStatistic.items():
			dot_file.write('  %s -> %s [label="%d calls" fontsize="10"]\n'%(node.symbol, child.symbol, calls))
	dot_file.write('}')
	dot_file.close()
	print 'export %s done.'%dot_file_name
	command = 'dot -Tpng -O %s'%dot_file_name
	os.system(command)
	print 'export %s.png done.'%dot_file_name


def output_gojsgraph():
	node_data_array = []
	for (key, node) in CallNode.NodeMap.items():
		node_data_array.append('{ "text" = "%s" }'%node.symbol)
	link_data_array = []

	for (key, node) in CallNode.NodeMap.items():
		for (child, calls) in node.callStatistic.items():
			link_data_array.append('{ "from": "%s", "to": "%s", "text":"%d calls" }'%(node.symbol, child.symbol, calls))

	gojs_file_name = '%s.gojs.json'%options.execfile
	gojs_file = open(gojs_file_name, 'w')
	gojs_file.write('{ "class": "go.GraphLinksModel", "nodeKeyProperty": "text",\n"nodeDataArray" : [\n')

	for rec in node_data_array:
		gojs_file.write('%s%c\n'%(rec, ',' if rec is not node_data_array[-1] else ' '))

	gojs_file.write('],\n "linkDataArray" : [\n')
	for rec in link_data_array:
		gojs_file.write('%s%c\n'%(rec, ',' if rec is not link_data_array[-1] else ' '))

	gojs_file.write(']\n}')
	gojs_file.close()
	print 'export %s done.'%gojs_file_name


def output_raw():
	for (key, node) in CallNode.NodeMap.items():
		print '0x%x   : %s'%(node.entry, node.symbol)
		for (child, calls) in node.callStatistic.items():
			print '  0x%x : %s : %d'%(child.entry, child.symbol, calls)


root_node = None
color_pannel = ['skyblue', 'darkseagreen', 'palevioletred', 'coral']
def traverse_in(stack, addr, node_data_array):
	current = CallNode(addr)
	key = 0
	if len(stack) > 0:
		(parent, parent_key) = stack[-1]
		parent.callSequence.append(current)
		index = len(parent.callSequence)
		key = (parent_key * 10) + index
		node_data_array.append('{"key":%d, "parent":%d, "text":"%s %d", "brush":"%s", "dir":"right"}'%(key, parent_key, current.symbol, index, color_pannel[key % len(color_pannel)]))
	else:
		root_node = current
		node_data_array.append('{"key":%x, "text":"%s"}'%(key, current.symbol))
	stack.append((current, key))

def traverse_out(stack, addr, node_data_array):
	(current, key) = stack.pop()
	if addr != current.entry:
		print 'call stack check faild'
		os.exit(1)

def output_gojstree():
	node_data_array = []
	f = open(options.tracefile)
	try:
		callstack = []
		for line in f:
			act  = line[0]
			addr = int(line[1:], base=16)
			{ 'E': lambda x: traverse_in(callstack, x, node_data_array),
			  'X': lambda x: traverse_out(callstack, x, node_data_array)
			}[act](addr)
	finally:
		f.close()

	gojs_file_name = '%s.gojstree.json'%options.execfile
	gojs_file = open(gojs_file_name, 'w')
	gojs_file.write('{ "class": "go.TreeModel", \n"nodeDataArray" : [\n')
	for rec in node_data_array:
		gojs_file.write('%s%c\n'%(rec, ',' if rec is not node_data_array[-1] else ' '))
	gojs_file.write(']\n}')
	gojs_file.close()
	print 'export %s done.'%gojs_file_name

#output_raw()
#output_graphviz()
#output_gojsgraph()
output_gojstree()
#print '----- unhandled stack ------'
#print callstack

