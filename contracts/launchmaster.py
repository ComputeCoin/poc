import os
import sys
import boto3
import botocore

key_id = os.environ['AWS_ACCESS_KEY_ID']
key = os.environ['AWS_SECRET_ACCESS_KEY']
region_name = os.environ['AWS_REGION']
key_pair_name = 'scala-dep-080417'
head_ami_id = 'ami-8dc792f7'
job_id = 'ab7e5dc3-ee0a-435f-aa7f-3505ac1011c9'
master_tag = 'lasagna/sccp-repository-dev/head/'+job_id
client_id = 'andre'

ec2_client = boto3.client(
    'ec2',
    aws_access_key_id=key_id,
    aws_secret_access_key=key,
    region_name=region_name)

#kill old master
filters = [{
    'Name': 'tag:Name',
    'Values': [master_tag]
}]

reservations = ec2_client.describe_instances(Filters=filters)
ids = []

for r in range(0, len(reservations['Reservations'])):
    for i in range(0, len(reservations['Reservations'][r]['Instances'])):
        ids.append(reservations['Reservations'][r]['Instances'][i]['InstanceId'])

if len(ids) > 0:
    print(ids)
    ec2_client.terminate_instances(InstanceIds=ids)


#params
#role, jobid, software, datafile, numCPUS, numNodes, numTasks, scratchSpace

user_data ='''#cloud-config
#repo_update: true
#repo_upgrade: all

runcmd:
 - [ sh, -c, "git clone git@github.com:scala-computing/aws-launcher.git ~/aws-launcher &>> ~/out.log" ]
 - [ sh, -c, "pip3.6 install -i ~/aws-launcher/requirements.txt &>> ~/out.log"]
 - [ sh, -c, "python3.6 ~/aws-launcher/setup.py head s3://sccp-repository-dev/{CLIENT_ID}/jobconf/{JOB_ID} &>> ~/out.log" ]
'''.format(
JOB_ID = job_id,
CLIENT_ID = client_id
)

status = ec2_client.run_instances(
    BlockDeviceMappings=[
        {
            'DeviceName': '/dev/sda1',
            'Ebs': {
                'DeleteOnTermination': True,
                'VolumeSize': 20,
                'VolumeType': 'standard'    # 'standard'|'io1'|'gp2'|'sc1'|'st1'
            }
        }
    ],
    InstanceType='c4.large',
    MinCount=1,
    MaxCount=1,
    ImageId=head_ami_id,
    UserData=user_data.encode('utf-8'),
    IamInstanceProfile={'Name': 'iam-role-dep-compute'},
    KeyName='scala-dep-080417',
    SecurityGroupIds=[ 'sg-0f814e7e' ],
    SubnetId='subnet-c89bf680',
    TagSpecifications=[{
        'ResourceType': 'instance',
        'Tags': [{'Key': 'Name', 'Value': master_tag}]
    }]
)

print(status)
